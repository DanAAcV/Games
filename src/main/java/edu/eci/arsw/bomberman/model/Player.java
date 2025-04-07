package edu.eci.arsw.bomberman.model;

public class Player {
    private String id;
    private String username;
    private int row;
    private int col;
    private int lives;
    private int score;
    private boolean isAlive;

    // Tipos de power-ups
    private int bombRange;
    private int maxBombs;
    private boolean wallPass;

    public Player(String id, String username) {
        this.id = id;
        this.username = username;
        this.lives = 3; // Vidas iniciales
        this.score = 0;
        this.isAlive = true;
        this.bombRange = 1; // Rango inicial de bombas
        this.maxBombs = 1; // Máximo de bombas inicial
        this.wallPass = false;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getCol() {
        return col;
    }

    public void setCol(int col) {
        this.col = col;
    }

    public void setPosition(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public int getLives() {
        return lives;
    }

    public void setLives(int lives) {
        this.lives = lives;
        if (this.lives <= 0) {
            this.isAlive = false;
        }
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public boolean isAlive() {
        return isAlive;
    }

    public int getBombRange() {
        return bombRange;
    }

    public void setBombRange(int bombRange) {
        this.bombRange = bombRange;
    }

    public int getMaxBombs() {
        return maxBombs;
    }

    public void setMaxBombs(int maxBombs) {
        this.maxBombs = maxBombs;
    }

    public boolean hasWallPass() {
        return wallPass;
    }

    public void setWallPass(boolean wallPass) {
        this.wallPass = wallPass;
    }

    // Métodos utilitarios
    public void addScore(int points) {
        this.score += points;
    }

    public void loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.isAlive = false;
        }
    }

    public void respawn(int row, int col) {
        if (this.lives > 0) {
            this.row = row;
            this.col = col;
            this.isAlive = true;
        }
    }

    @Override
    public String toString() {
        return "Player{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", position=(" + row + "," + col + ")" +
                ", lives=" + lives +
                ", score=" + score +
                '}';
    }
}