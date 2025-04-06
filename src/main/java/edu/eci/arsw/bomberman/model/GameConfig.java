// GameConfig.java (model)
package edu.eci.arsw.bomberman.model;

public class GameConfig {
    private String host;
    private int duration; // in minutes
    private int playerCount;
    private int blockCount;
    private int livesPerPlayer;

    // Constructors, getters and setters
    public GameConfig() {}

    public GameConfig(String host, int duration, int playerCount, int blockCount, int livesPerPlayer) {
        this.host = host;
        this.duration = duration;
        this.playerCount = playerCount;
        this.blockCount = blockCount;
        this.livesPerPlayer = livesPerPlayer;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getBlockCount() {
        return blockCount;
    }

    public void setBlockCount(int blockCount) {
        this.blockCount = blockCount;
    }

    public int getPlayerCount() {
        return playerCount;
    }

    public void setPlayerCount(int playerCount) {
        this.playerCount = playerCount;
    }

    public int getLivesPerPlayer() {
        return livesPerPlayer;
    }

    public void setLivesPerPlayer(int livesPerPlayer) {
        this.livesPerPlayer = livesPerPlayer;
    }
}