package edu.eci.arsw.bomberman.model;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class GameBoard {
    private final String[][] board;
    private final ConcurrentMap<String, PlayerPosition> players;
    private final String scenario;
    private final int width;
    private final int height;

    public GameBoard(String scenario, int width, int height, int blockCount) {
        this.scenario = scenario;
        this.width = width;
        this.height = height;
        this.board = new String[height][width];
        this.players = new ConcurrentHashMap<>();
        initializeBoard(blockCount);
    }

    private void initializeBoard(int blockCount) {
        // Inicializar paredes y bloques
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                if (i == 0 || i == height - 1 || j == 0 || j == width - 1) {
                    board[i][j] = "#"; // Paredes indestructibles
                } else if (i % 2 == 0 && j % 2 == 0) {
                    board[i][j] = "#"; // Paredes internas
                } else {
                    board[i][j] = " "; // Espacio vacío
                }
            }
        }

        // Añadir bloques rompibles
        int blocksPlaced = 0;
        while (blocksPlaced < blockCount) {
            int row = 1 + (int)(Math.random() * (height - 2));
            int col = 1 + (int)(Math.random() * (width - 2));

            if (board[row][col].equals(" ")) {
                board[row][col] = "X";
                blocksPlaced++;
            }
        }
    }

    public synchronized boolean addPlayer(String playerId) {
        if (players.size() >= 4) return false;

        int[][] spawnPoints = {
                {1, 1}, {1, width - 2},
                {height - 2, 1}, {height - 2, width - 2}
        };

        for (int[] pos : spawnPoints) {
            if (board[pos[0]][pos[1]].equals(" ")) {
                players.put(playerId, new PlayerPosition(pos[0], pos[1]));
                board[pos[0]][pos[1]] = "P" + players.size();
                return true;
            }
        }
        return false;
    }

    public synchronized void movePlayer(String playerId, int dx, int dy) {
        PlayerPosition pos = players.get(playerId);
        if (pos == null) return;

        int newRow = pos.row + dy;
        int newCol = pos.col + dx;

        if (newRow >= 0 && newRow < height &&
                newCol >= 0 && newCol < width &&
                board[newRow][newCol].equals(" ")) {

            board[pos.row][pos.col] = " ";
            board[newRow][newCol] = "P" + getPlayerNumber(playerId);
            pos.row = newRow;
            pos.col = newCol;
        }
    }

    private int getPlayerNumber(String playerId) {
        int i = 1;
        for (String id : players.keySet()) {
            if (id.equals(playerId)) return i;
            i++;
        }
        return 0;
    }

    public String getBoardState() {
        StringBuilder sb = new StringBuilder();
        for (String[] row : board) {
            sb.append(String.join(" ", row)).append("\n");
        }
        return sb.toString();
    }

    // Clase interna para posiciones de jugadores
    private static class PlayerPosition {
        int row, col;
        PlayerPosition(int row, int col) {
            this.row = row;
            this.col = col;
        }
    }

    public ConcurrentMap<String, PlayerPosition> getPlayers() {
        return players;
    }
}