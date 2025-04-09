window.addEventListener('DOMContentLoaded', () => {
    const config = JSON.parse(sessionStorage.getItem("gameConfig"));
    const player = sessionStorage.getItem("username");

    if (!config || !player) {
        alert("Missing game configuration. Redirecting...");
        window.location.href = "/lobby.html";
        return;
    }

    document.getElementById('gameCode').textContent = config.code;
    document.getElementById('playerName').textContent = player;
    document.getElementById('lives').textContent = config.livesPerPlayer;
    document.getElementById('timer').textContent = `${config.duration}:00`;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const tileSize = 32;

    const imagePaths = {
        "background": `/images/scenarios/${config.scenario}.png`,
        "X": "/images/table/Wall.png",
        "#": "/images/table/Breakable.png",
        "!": "/images/table/PowerUp.png",
        "P": "/images/table/Player.png",
        "B": "/images/table/Bomb.png",
        "E": "/images/table/Explotion.png",
        " ": null
    };

    const images = {};
    let bombPlaced = false;
    let playerPos = [1, 1];
    let currentLives = config.livesPerPlayer;
    let timerInterval;

    const stats = {
        lives: currentLives,
        bombsPlaced: 0,
        blocksDestroyed: 0,
        powerUpsCollected: 0
    };

    function preloadImages(callback) {
        let loaded = 0, total = Object.keys(imagePaths).length;
        for (let [key, path] of Object.entries(imagePaths)) {
            if (!path) { loaded++; continue; }
            const img = new Image();
            img.src = path;
            img.onload = () => { images[key] = img; if (++loaded === total) callback(); };
            img.onerror = () => { console.error("Error loading " + path); if (++loaded === total) callback(); };
        }
    }

    function createMatrix(rows, cols) {
        return Array.from({ length: rows }, () => Array(cols).fill(" "));
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function generateMatrix(cfg) {
        const rows = 15, cols = 20;
        const matrix = createMatrix(rows, cols);

        for (let i = 0; i < rows; i++) matrix[i][0] = matrix[i][cols - 1] = "X";
        for (let j = 0; j < cols; j++) matrix[0][j] = matrix[rows - 1][j] = "X";

        const inner = [];
        for (let r = 1; r < rows - 1; r++)
            for (let c = 1; c < cols - 1; c++)
                inner.push([r, c]);

        shuffle(inner);
        let idx = 0;

        for (let i = 0; i < 75 && idx < inner.length; i++) matrix[inner[idx][0]][inner[idx++][1]] = "X";
        for (let i = 0; i < cfg.blockCount && idx < inner.length;) {
            const [r, c] = inner[idx++];
            if (matrix[r][c] === " ") { matrix[r][c] = "#"; i++; }
        }
        for (let i = 0; i < cfg.powerUps && idx < inner.length;) {
            const [r, c] = inner[idx++];
            if (matrix[r][c] === " ") { matrix[r][c] = "!"; i++; }
        }

        while (idx < inner.length) {
            const [r, c] = inner[idx++];
            if (matrix[r][c] === " ") {
                matrix[r][c] = "P";
                playerPos = [r, c];
                break;
            }
        }

        return matrix;
    }

    const matrix = generateMatrix(config);

    function drawBackground() {
        const bg = images["background"];
        if (bg) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    }

    function drawMatrix() {
        drawBackground();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                const symbol = matrix[r][c];
                const img = images[symbol];
                if (img) ctx.drawImage(img, c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    function endGame(message) {
        clearInterval(timerInterval);
        alert(message);

        const summary = `
🎮 Game Over!
👤 Player: ${player}
❤️ Lives: ${stats.lives}
💣 Bombs: ${stats.bombsPlaced}
🧱 Blocks Destroyed: ${stats.blocksDestroyed}
⚡ Power-Ups: ${stats.powerUpsCollected}
        `;
        alert(summary);
    }

    function startCountdown(minutes) {
        let total = minutes * 60;
        const timer = document.getElementById('timer');
        timerInterval = setInterval(() => {
            if (--total < 0) {
                clearInterval(timerInterval);
                endGame("⏱️ Time's up! It's a draw.");
                return;
            }
            const m = Math.floor(total / 60);
            const s = total % 60;
            timer.textContent = `${m}:${s.toString().padStart(2, "0")}`;
        }, 1000);
    }

    function movePlayer(key) {
        const [r, c] = playerPos;
        let [nr, nc] = [r, c];
        if (key === "ArrowUp") nr--;
        else if (key === "ArrowDown") nr++;
        else if (key === "ArrowLeft") nc--;
        else if (key === "ArrowRight") nc++;

        const dest = matrix[nr]?.[nc];
        if (dest === " ") {
            matrix[r][c] = " ";
            matrix[nr][nc] = "P";
            playerPos = [nr, nc];
            drawMatrix();
        }
    }

    function placeBomb() {
        if (bombPlaced) return;
        const [r, c] = playerPos;
        matrix[r][c] = "B";
        bombPlaced = true;
        stats.bombsPlaced++;
        drawMatrix();

        setTimeout(() => {
            explodeBomb(r, c);
            bombPlaced = false;
        }, 3000);
    }

    function explodeBomb(row, col) {
        const dirs = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
        const exploded = [];

        for (let [dr, dc] of dirs) {
            for (let i = 0; i <= (dr === 0 && dc === 0 ? 0 : 3); i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r < 0 || c < 0 || r >= matrix.length || c >= matrix[0].length) break;

                const cell = matrix[r][c];
                if (cell === "X") break;
                if (cell === "#") {
                    stats.blocksDestroyed++;
                    exploded.push([r, c]);
                    break;
                }

                if (cell === "!") stats.powerUpsCollected++;
                exploded.push([r, c]);
            }
        }

        for (const [r, c] of exploded) matrix[r][c] = "E";
        drawMatrix();

        // Daño al jugador
        const [pr, pc] = playerPos;
        if (exploded.some(([r, c]) => r === pr && c === pc)) {
            currentLives--;
            stats.lives = currentLives;
            document.getElementById('lives').textContent = currentLives;
            if (currentLives <= 0) {
                endGame("💀 You lost all your lives!");
                return;
            }
        }

        setTimeout(() => {
            for (const [r, c] of exploded)
                if (matrix[r][c] === "E") matrix[r][c] = " ";
            matrix[playerPos[0]][playerPos[1]] = "P";
            drawMatrix();
        }, 1000);
    }

    preloadImages(() => {
        drawMatrix();
        startCountdown(config.duration);
    });

    document.addEventListener("keydown", e => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) movePlayer(e.key);
        else if (e.code === "Space") {
            e.preventDefault();
            placeBomb();
        }
    });
});
