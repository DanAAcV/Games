// Configuración y lógica del juego
document.addEventListener('DOMContentLoaded', () => {
    // Get username from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    document.getElementById('user-greeting').textContent = `Hello, ${username || 'Player'}!`;

    // Configuration elements
    const gameDuration = document.getElementById('gameDuration');
    const playerCount = document.getElementById('playerCount');
    const blockCount = document.getElementById('blockCount');
    const livesCount = document.getElementById('livesCount');
    const startGameBtn = document.getElementById('startGameBtn');
    const errorMessage = document.getElementById('error-message');
    const configDetails = document.getElementById('config-details');

    // Game configuration object
    const gameConfig = {
        host: username,
        duration: 5,
        players: 2,
        blocks: 15,
        lives: 3
    };

    // Update configuration summary
    function updateConfigSummary() {
        configDetails.innerHTML = `
            <strong>Host:</strong> ${gameConfig.host}<br>
            <strong>Duration:</strong> ${gameConfig.duration} minutes<br>
            <strong>Players:</strong> ${gameConfig.players}<br>
            <strong>Blocks:</strong> ${gameConfig.blocks}<br>
            <strong>Lives per player:</strong> ${gameConfig.lives}
        `;
    }

    // Validate inputs
    function validateInputs() {
        errorMessage.textContent = '';

        if (playerCount.value < 1 || playerCount.value > 4) {
            errorMessage.textContent = 'Player count must be between 1 and 4';
            return false;
        }

        if (blockCount.value < 1 || blockCount.value > 30) {
            errorMessage.textContent = 'Block count must be between 1 and 30';
            return false;
        }

        if (livesCount.value < 1 || livesCount.value > 10) {
            errorMessage.textContent = 'Lives count must be between 1 and 10';
            return false;
        }

        return true;
    }

    // Event listeners
    playerCount.addEventListener('change', () => {
        if (playerCount.value < 1) playerCount.value = 1;
        if (playerCount.value > 4) playerCount.value = 4;
        gameConfig.players = parseInt(playerCount.value);
        updateConfigSummary();
    });

    blockCount.addEventListener('change', () => {
        if (blockCount.value < 1) blockCount.value = 1;
        if (blockCount.value > 30) blockCount.value = 30;
        gameConfig.blocks = parseInt(blockCount.value);
        updateConfigSummary();
    });

    livesCount.addEventListener('change', () => {
        if (livesCount.value < 1) livesCount.value = 1;
        if (livesCount.value > 10) livesCount.value = 10;
        gameConfig.lives = parseInt(livesCount.value);
        updateConfigSummary();
    });

    gameDuration.addEventListener('change', () => {
        gameConfig.duration = parseInt(gameDuration.value);
        updateConfigSummary();
    });

    // Start game button handler
    startGameBtn.addEventListener('click', async () => {
        if (validateInputs()) {
            gameConfig.duration = parseInt(gameDuration.value);
            gameConfig.players = parseInt(playerCount.value);
            gameConfig.blocks = parseInt(blockCount.value);
            gameConfig.lives = parseInt(livesCount.value);

            try {
                const response = await fetch('/api/game/configure', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gameConfig)
                });

                if (response.ok) {
                    document.getElementById('config-panel').style.display = 'none';
                    document.getElementById('game-container').style.display = 'block';
                    initializeGame(gameConfig);
                } else {
                    const error = await response.text();
                    errorMessage.textContent = error;
                }
            } catch (error) {
                console.error("Error:", error);
                errorMessage.textContent = "Network error occurred";
            }
        }
    });

    // Initialize game function
    function initializeGame(config) {
        console.log('Initializing game with config:', config);
        // Implementar lógica del juego aquí
    }

    // Initial setup
    updateConfigSummary();
});
