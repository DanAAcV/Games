document.addEventListener('DOMContentLoaded', () => {
    // Get username from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    document.getElementById('user-greeting').textContent = `Hello, ${username || 'Player'}!`;

    // Game configuration
    const gameConfig = {
        host: username,
        scenario: 'Forest', // Default scenario
        duration: 5,
        playerCount: 2,
        blockCount: 15,
        livesPerPlayer: 3,
        code: null,
        players: [username]
    };

    // Scenario dropdown functionality
    const scenarioDropdown = document.getElementById('scenarioDropdown');
    const scenarioToggle = document.getElementById('scenarioToggle');
    const scenarioMenu = document.getElementById('scenarioMenu');
    const selectedScenarioImage = document.getElementById('selectedScenarioImage');
    const selectedScenarioName = document.getElementById('selectedScenarioName');

    // Toggle dropdown
    scenarioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        scenarioDropdown.classList.toggle('active');
    });

    // Select scenario
    document.querySelectorAll('.scenario-option').forEach(option => {
        option.addEventListener('click', () => {
            const scenario = option.dataset.scenario;
            const imgSrc = option.querySelector('img').src;
            const scenarioName = option.querySelector('.scenario-name').textContent;

            // Update selected scenario
            selectedScenarioImage.src = imgSrc;
            selectedScenarioName.textContent = scenarioName;
            gameConfig.scenario = scenario;

            // Close dropdown
            scenarioDropdown.classList.remove('active');

            // Update config summary
            updateConfigSummary();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        scenarioDropdown.classList.remove('active');
    });

    // Tab switching
    const createTab = document.getElementById('create-tab');
    const joinTab = document.getElementById('join-tab');
    const createContent = document.getElementById('create-content');
    const joinContent = document.getElementById('join-content');

    const switchTab = (activeTab, activeContent, inactiveTab, inactiveContent) => {
        activeTab.classList.add('active');
        inactiveTab.classList.remove('active');
        activeContent.classList.add('active');
        inactiveContent.classList.remove('active');
        clearErrorMessages();
    };

    createTab.addEventListener('click', () => switchTab(createTab, createContent, joinTab, joinContent));
    joinTab.addEventListener('click', () => switchTab(joinTab, joinContent, createTab, createContent));

    // Generate 5-digit game code
    const generateGameCode = () => Math.floor(10000 + Math.random() * 90000).toString();

    // Update configuration summary
    const updateConfigSummary = () => {
        document.getElementById('config-details').innerHTML = `
            <strong>Host:</strong> ${gameConfig.host}<br>
            <strong>Scenario:</strong> ${gameConfig.scenario}<br>
            <strong>Duration:</strong> ${gameConfig.duration} minutes<br>
            <strong>Players:</strong> ${gameConfig.playerCount}<br>
            <strong>Blocks:</strong> ${gameConfig.blockCount}<br>
            <strong>Lives per player:</strong> ${gameConfig.livesPerPlayer}
        `;
    };

    // Clear error messages
    const clearErrorMessages = () => {
        document.getElementById('error-message').textContent = '';
        document.getElementById('join-error-message').textContent = '';
    };

    // Validate game code input
    document.getElementById('gameCodeInput').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        clearErrorMessages();
    });

    // Join existing game
    document.getElementById('joinGameBtn').addEventListener('click', async () => {
        const gameCode = document.getElementById('gameCodeInput').value.trim();
        const errorElement = document.getElementById('join-error-message');
        const spinner = document.getElementById('joinSpinner');

        if (gameCode.length !== 5) {
            errorElement.textContent = 'Please enter a valid 5-digit game code';
            return;
        }

        try {
            spinner.style.display = 'block';

            // Simulación mejorada que incluye TODA la configuración del juego
            const mockResponse = {
                ok: true,
                json: async () => ({
                    code: gameCode,
                    scenario: 'Volcan',
                    duration: 5,
                    playerCount: 2,
                    blockCount: 15,
                    livesPerPlayer: 3,
                    players: ['Alejandro', username],
                    host: 'Alejandro',
                    status: 'waiting'
                })
            };

            // Para producción, usar esto:
            // const response = await fetch(`/api/game/join?code=${gameCode}`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ username })
            // });

            const response = mockResponse; // Cambiar por la línea de arriba en producción

            if (!response.ok) {
                throw new Error('Failed to join game');
            }

            const gameData = await response.json();
            redirectToLobby(gameData);
        } catch (error) {
            console.error("Join game error:", error);
            errorElement.textContent = error.message || "Failed to join game. Please check the code and try again.";
        } finally {
            spinner.style.display = 'none';
        }
    });

    // Create new game
    document.getElementById('createGameBtn').addEventListener('click', async () => {
        const errorElement = document.getElementById('error-message');
        const spinner = document.getElementById('createSpinner');
        clearErrorMessages();

        try {
            // Validate inputs
            const playerCount = parseInt(document.getElementById('playerCount').value);
            const blockCount = parseInt(document.getElementById('blockCount').value);
            const livesPerPlayer = parseInt(document.getElementById('livesCount').value);

            if (playerCount < 1 || playerCount > 4) {
                throw new Error('Player count must be between 1 and 4');
            }
            if (blockCount < 1 || blockCount > 30) {
                throw new Error('Block count must be between 1 and 30');
            }
            if (livesPerPlayer < 1 || livesPerPlayer > 10) {
                throw new Error('Lives per player must be between 1 and 10');
            }

            // Prepare config
            const config = {
                host: username,
                scenario: gameConfig.scenario,
                duration: parseInt(document.getElementById('gameDuration').value),
                playerCount: playerCount,
                blockCount: blockCount,
                livesPerPlayer: livesPerPlayer,
                players: [username]
            };

            spinner.style.display = 'block';

            // Simulación que incluye toda la configuración
            const mockResponse = {
                ok: true,
                json: async () => ({
                    code: generateGameCode(),
                    ...config,
                    status: 'waiting'
                })
            };

            // Para producción, usar esto:
            // const response = await fetch('/api/game/create', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(config)
            // });

            const response = mockResponse; // Cambiar por la línea de arriba en producción

            if (!response.ok) {
                throw new Error('Failed to create game');
            }

            const gameData = await response.json();
            document.getElementById('game-code').textContent = gameData.code;
            document.getElementById('game-code-display').style.display = 'block';
            redirectToLobby(gameData);
        } catch (error) {
            console.error("Create game error:", error);
            errorElement.textContent = error.message || "Failed to create game";
        } finally {
            spinner.style.display = 'none';
        }
    });

    // Redirect to lobby page with game data
    const redirectToLobby = (gameData) => {
        // Store game data in sessionStorage
        sessionStorage.setItem('gameConfig', JSON.stringify(gameData));
        // Store username in sessionStorage
        sessionStorage.setItem('username', username);
        // Redirect to lobby page
        window.location.href = '/lobby.html';
    };

    // Initial setup
    updateConfigSummary();
});
