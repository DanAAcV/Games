class BombermanGame {
    constructor() {
        // Configuración inicial
        this.cellSize = 40;
        this.boardWidth = 15;
        this.boardHeight = 13;

        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        this.playerId = urlParams.get('playerId') || '1';
        this.gameCode = urlParams.get('code');
        this.username = urlParams.get('user') || `Player ${this.playerId}`;

        // Estado del juego
        this.gameState = null;
        this.players = {};
        this.images = {};
        this.lastUpdate = 0;
        this.isPaused = false;

        // Inicializar el juego
        this.initElements();
        this.initGame();
    }

    async initGame() {
        // Mostrar información del jugador
        document.getElementById('player-name').textContent = this.username;

        // Cargar imágenes
        await this.loadImages();

        // Inicializar tablero
        this.initBoard();

        // Conectar al juego
        this.connectToGame();

        // Configurar controles
        this.setupControls();
    }

    initElements() {
        this.boardElement = document.getElementById('game-board');
        this.statusElement = document.getElementById('game-status');
        this.timerElement = document.getElementById('game-timer');
    }

    async loadImages() {
        // Tipos de elementos del juego
        const elements = {
            '#': 'Wall.png',
            'X': 'Breakable.png',
            'B': 'Bomb.png',
            '!': 'PowerUp.png',
            '*': 'Explotion.png',
            'P': 'Player.png'
        };

        // Cargar cada imagen
        const loadImage = (src) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = `/images/table/${src}`;
        });

        // Cargar todas las imágenes
        for (const [key, file] of Object.entries(elements)) {
            this.images[key] = await loadImage(file);
        }
    }

    initBoard() {
        // Configurar tamaño del tablero
        this.boardElement.style.gridTemplateColumns = `repeat(${this.boardWidth}, ${this.cellSize}px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.boardHeight}, ${this.cellSize}px)`;
        this.boardElement.style.width = `${this.boardWidth * this.cellSize}px`;
        this.boardElement.style.height = `${this.boardHeight * this.cellSize}px`;

        // Crear celdas vacías
        this.boardElement.innerHTML = '';
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                this.boardElement.appendChild(cell);
            }
        }
    }

    connectToGame() {
        // Simulación de WebSocket (en producción usar new WebSocket())
        this.socket = {
            send: (data) => console.log('WS Send:', data),
            onmessage: (callback) => {
                this.updateInterval = setInterval(async () => {
                    if (this.isPaused) return;

                    const state = await this.fetchGameState();
                    if (state) callback({ data: JSON.stringify(state) });
                }, 200); // Actualizar cada 200ms
            }
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateGameState(data);
        };
    }

    async fetchGameState() {
        try {
            const response = await fetch(`/api/game/state?code=${this.gameCode}`);
            if (!response.ok) throw new Error('Failed to fetch game state');
            return await response.json();
        } catch (error) {
            console.error('Error fetching game state:', error);
            this.statusElement.textContent = 'Connection error - Retrying...';
            return null;
        }
    }

    updateGameState(state) {
        if (!state || !state.boardState) return;

        this.gameState = state;

        // Actualizar estado del juego
        this.statusElement.textContent = state.isRunning ?
            (this.isPaused ? 'Game Paused' : 'Game in progress') :
            'Waiting to start';

        // Actualizar temporizador
        this.updateTimer(state.remainingTime);

        // Renderizar tablero
        this.renderBoard(state);
    }

    updateTimer(seconds) {
        if (seconds === undefined || seconds <= 0) {
            this.timerElement.textContent = "00:00";
            return;
        }

        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        this.timerElement.textContent = `${mins}:${secs}`;

        // Cambiar color cuando queda poco tiempo
        if (seconds <= 30) {
            this.timerElement.style.color = seconds % 2 === 0 ? '#FF5252' : '#FFC107';
        } else {
            this.timerElement.style.color = '#FFF';
        }
    }

    renderBoard(state) {
        // Parsear estado del tablero
        const board = state.boardState.split('\n')
            .filter(row => row.trim())
            .map(row => row.trim().split(' '));

        // Colores para jugadores
        const playerColors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107'];

        // Renderizar cada celda
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.innerHTML = '';

                const value = board[row][col];

                // Fondo del escenario
                if (row === 0 && col === 0 && state.scenario) {
                    cell.style.backgroundImage = `url(/images/scenarios/${state.scenario}.png)`;
                    cell.style.backgroundSize = 'cover';
                }

                // Elementos del juego
                if (value !== ' ' && this.images[value.charAt(0)]) {
                    const img = document.createElement('img');
                    img.src = this.images[value.charAt(0)].src;
                    img.alt = value;

                    // Aplicar clases según el tipo de elemento
                    if (value.startsWith('P')) {
                        img.classList.add('player');
                        const playerNum = parseInt(value.substring(1)) || 1;
                        img.style.filter = `hue-rotate(${(playerNum-1)*90}deg)`;

                        // Resaltar al jugador actual
                        if (playerNum.toString() === this.playerId) {
                            img.classList.add('highlight');
                        }
                    }
                    else if (value === 'B') img.classList.add('bomb');
                    else if (value === '*') img.classList.add('explosion');

                    cell.appendChild(img);
                }
            }
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            // Pausar/reanudar el juego
            if (e.key.toLowerCase() === 'p') {
                this.isPaused = !this.isPaused;
                this.statusElement.textContent = this.isPaused ?
                    'Game Paused' : 'Game in progress';
                return;
            }

            if (!this.gameState?.isRunning || this.isPaused) return;

            const directions = {
                'ArrowUp': 'UP',
                'ArrowDown': 'DOWN',
                'ArrowLeft': 'LEFT',
                'ArrowRight': 'RIGHT'
            };

            if (e.key === ' ') {
                this.placeBomb();
                e.preventDefault();
            }
            else if (directions[e.key]) {
                this.movePlayer(directions[e.key]);
                e.preventDefault();
            }
        });
    }

    movePlayer(direction) {
        fetch(`/api/game/move?code=${this.gameCode}&playerId=${this.playerId}&direction=${direction}`, {
            method: 'POST'
        }).catch(console.error);
    }

    placeBomb() {
        fetch(`/api/game/place-bomb?code=${this.gameCode}&playerId=${this.playerId}`, {
            method: 'POST'
        }).catch(console.error);
    }

    cleanup() {
        if (this.updateInterval) clearInterval(this.updateInterval);
    }
}

// Iniciar el juego cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    const game = new BombermanGame();

    // Limpiar al salir
    window.addEventListener('beforeunload', () => game.cleanup());
});
