document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos del juego desde sessionStorage
    const gameData = JSON.parse(sessionStorage.getItem('gameConfig'));
    const username = sessionStorage.getItem('username');

    // Elementos del DOM
    const startBtn = document.getElementById('startBattleBtn');
    const spinner = document.getElementById('loadingSpinner');
    const gameStatus = document.getElementById('game-status');
    const playersList = document.getElementById('players-list');

    // Verificar que los datos necesarios existen
    if (!gameData || !username || !gameData.code) {
        window.location.href = '/';
        return;
    }

    // Mostrar información inicial del juego
    document.getElementById('game-code').textContent = gameData.code;
    document.getElementById('scenario-display').textContent = gameData.scenario || 'Unknown';
    document.getElementById('player-count').textContent =
        `${gameData.players ? gameData.players.length : 1}/${gameData.playerCount || 4}`;
    document.getElementById('duration').textContent = gameData.duration || 5;
    document.getElementById('block-count').textContent = gameData.blockCount || 15;
    document.getElementById('lives-count').textContent = gameData.livesPerPlayer || 3;
    document.getElementById('powerups-count').textContent = gameData.powerUpCount || 10;

    // Mostrar lista de jugadores
    const updatePlayersList = () => {
        playersList.innerHTML = '';

        if (gameData.players && gameData.players.length > 0) {
            gameData.players.forEach(player => {
                const li = document.createElement('li');

                if (player === gameData.host) {
                    li.innerHTML = `<span class="player-host">${player} (Host)</span>`;
                } else {
                    li.textContent = player;
                }

                playersList.appendChild(li);
            });
        }
    };

    updatePlayersList();

    // Función para actualizar el estado del juego
    const updateGameState = async () => {
        try {
            const response = await fetch(`/api/game/info?code=${gameData.code}`);
            if (!response.ok) throw new Error('Failed to fetch game info');

            const gameInfo = await response.json();

            // Actualizar lista de jugadores si hay cambios
            if (JSON.stringify(gameInfo.players) !== JSON.stringify(gameData.players)) {
                gameData.players = gameInfo.players;
                updatePlayersList();
                document.getElementById('player-count').textContent =
                    `${gameInfo.players.length}/${gameData.playerCount}`;
            }

            // Actualizar estado del juego
            if (gameInfo.inProgress) {
                gameStatus.textContent = 'Game starting soon...';
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error updating game state:", error);
            return false;
        }
    };

    // Configurar botón de inicio (solo para el host)
    if (gameData.host === username) {
        startBtn.style.display = 'block';

        startBtn.addEventListener('click', async () => {
            startBtn.disabled = true;
            spinner.style.display = 'block';
            gameStatus.textContent = 'Starting game...';

            try {
                const response = await fetch(`/api/game/start?code=${gameData.code}`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to start game');
                }

                // Esperar 2 segundos antes de redirigir para dar tiempo al servidor
                setTimeout(() => {
                    window.location.href = `/play.html?code=${gameData.code}&user=${username}`;
                }, 2000);

            } catch (error) {
                console.error("Error starting game:", error);
                gameStatus.textContent = error.message;
                startBtn.disabled = false;
                spinner.style.display = 'none';
            }
        });
    } else {
        // Para jugadores que no son host, verificar si el juego ha comenzado
        const checkGameStarted = async () => {
            const gameStarted = await updateGameState();
            if (gameStarted) {
                // Redirigir al juego después de breve espera
                setTimeout(() => {
                    window.location.href = `/play.html?code=${gameData.code}&user=${username}`;
                }, 2000);
            } else {
                // Revisar nuevamente en 3 segundos
                setTimeout(checkGameStarted, 3000);
            }
        };

        checkGameStarted();
    }
});
