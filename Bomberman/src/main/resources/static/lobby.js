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

        // Generar el mapa del juego
        const gameMap = new BombermanMap({
            size: 15,
            blockCount: config.blockCount,
            playerCount: config.playerCount,
            powerUpPercentage: 0.1 // 10% de los bloques tendrán power-ups
        }).generate();

        // Mostrar mapa en consola
        console.log("=== MAPA DEL JUEGO BOMBERMAN ===");
        console.log("Leyenda:");
        console.log("X - Bloques indestructibles");
        console.log("# - Bloques destructibles");
        console.log("! - Power-ups");
        console.log("P - Jugadores");
        console.log("\nMapa generado:");
        gameMap.printToConsole();

        // Simulate API call to start game
        setTimeout(() => {
            // Redirect to game page
            window.location.href = `/play?code=${config.code}&user=${username}`;
            }, 2000);
    };
});

class BombermanMap {
    constructor(config) {
        this.size = config.size || 15;
        this.blockCount = config.blockCount || 30;
        this.playerCount = config.playerCount || 2;
        this.powerUpPercentage = config.powerUpPercentage || 0.1;
        this.map = Array(this.size).fill().map(() => Array(this.size).fill(' '));
    }

    generate() {
        this.addBorders();
        this.addFixedBlocks();
        this.addDestructibleBlocks();
        this.addPlayers();
        this.addPowerUps();
        return this;
    }

    addBorders() {
        for (let i = 0; i < this.size; i++) {
            this.map[0][i] = 'X';          // Borde superior
            this.map[this.size-1][i] = 'X'; // Borde inferior
            this.map[i][0] = 'X';          // Borde izquierdo
            this.map[i][this.size-1] = 'X'; // Borde derecho
        }
    }

    addFixedBlocks() {
        // Patrón de ajedrez para bloques fijos
        for (let i = 2; i < this.size-2; i += 2) {
            for (let j = 2; j < this.size-2; j += 2) {
                this.map[i][j] = 'X';
            }
        }
    }

    addDestructibleBlocks() {
        let blocksPlaced = 0;
        const maxBlocks = Math.min(this.blockCount, 100);

        while (blocksPlaced < maxBlocks) {
            const x = this.getRandomPosition();
            const y = this.getRandomPosition();

            if (this.map[y][x] === ' ') {
                this.map[y][x] = '#';
                blocksPlaced++;
            }
        }
    }

    addPlayers() {
        const positions = [
            [1, 1],                     // Esquina superior izquierda
            [1, this.size-2],           // Esquina superior derecha
            [this.size-2, 1],           // Esquina inferior izquierda
            [this.size-2, this.size-2]  // Esquina inferior derecha
        ];

        for (let i = 0; i < Math.min(this.playerCount, 4); i++) {
            const [x, y] = positions[i];
            this.map[y][x] = 'P';
        }
    }

    addPowerUps() {
        const totalPowerUps = Math.floor(this.blockCount * this.powerUpPercentage);
        let powerUpsPlaced = 0;

        while (powerUpsPlaced < totalPowerUps) {
            const x = this.getRandomPosition();
            const y = this.getRandomPosition();

            if (this.map[y][x] === '#') {
                this.map[y][x] = '!';
                powerUpsPlaced++;
            }
        }
    }

    getRandomPosition() {
        return Math.floor(Math.random() * (this.size-2)) + 1;
    }

    printToConsole() {
        const legend = "Leyenda: X - Indestructible | # - Destructible | ! - PowerUp | P - Jugador";
        console.log(legend);
        console.log("=".repeat(legend.length));

        this.map.forEach(row => {
            console.log(row.join(' '));
        });

        console.log("\nConfiguración del mapa:");
        console.log(`- Tamaño: ${this.size}x${this.size}`);
        console.log(`- Bloques destructibles: ${this.blockCount}`);
        console.log(`- Jugadores: ${this.playerCount}`);
        console.log(`- Power-ups: ${Math.floor(this.blockCount * this.powerUpPercentage)}`);
    }

    getMap() {
        return this.map;
    }
}
