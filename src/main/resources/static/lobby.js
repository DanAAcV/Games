document.addEventListener('DOMContentLoaded', () => {
    // Get game configuration from session storage
    const gameData = JSON.parse(sessionStorage.getItem('gameConfig'));
    const username = sessionStorage.getItem('username');

    if (!gameData || !username) {
        alert('No se encontraron datos del juego. Redirigiendo a la página principal.');
        window.location.href = '/';
        return;
    }

    // Display game info
    document.getElementById('scenario-display').textContent = gameData.scenario;
    document.getElementById('player-count').textContent = gameData.playerCount;
    document.getElementById('duration').textContent = gameData.duration;
    document.getElementById('block-count').textContent = gameData.blockCount;
    document.getElementById('lives-count').textContent = gameData.livesPerPlayer;
    document.getElementById('game-title').textContent = `Game ${gameData.code} Lobby`;

    // Display players list
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = ''; // Clear any existing items
    gameData.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player === gameData.host ? `${player} (Host)` : player;
        playersList.appendChild(li);
    });

    // Show start button only for host
    if (username === gameData.host) {
        const startBtn = document.getElementById('startBattleBtn');
        startBtn.style.display = 'block';
        startBtn.addEventListener('click', () => {
            startBattle(gameData);
        });
    }

    const startBattle = (config) => {
        const spinner = document.getElementById('loadingSpinner');
        const startBtn = document.getElementById('startBattleBtn');

        startBtn.style.display = 'none';
        spinner.style.display = 'block';
        document.getElementById('game-status').textContent = 'Iniciando partida...';

        // Simulate API call to start game
        setTimeout(() => {
            // Redirect to game page
            window.location.href = `/play.html?code=${config.code}&user=${username}`;
        }, 2000);
    };
});
