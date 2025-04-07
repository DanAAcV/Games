package edu.eci.arsw.bomberman.model;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class GameSession {
    private final String code;
    private final GameConfig config;
    private final List<String> players;
    private boolean inProgress;
    private long startTime;
    private long duration; // duración en milisegundos

    public GameSession(String code, GameConfig config) {
        this.code = code;
        this.config = config;
        this.players = new CopyOnWriteArrayList<>();
        this.players.add(config.getHost());
        this.inProgress = false;
        this.duration = config.getDuration() * 60 * 1000L; // Convertir minutos a ms
    }

    public synchronized boolean startGame() {
        if (inProgress || players.size() < 1) return false;
        this.inProgress = true;
        this.startTime = System.currentTimeMillis();
        return true;
    }

    public synchronized boolean addPlayer(String username) {
        if (inProgress || players.size() >= config.getPlayerCount()) return false;
        players.add(username);
        return true;
    }

    public synchronized void removePlayer(String username) {
        players.remove(username);
    }

    public int getRemainingTime() {
        if (!inProgress) return 0;
        long elapsed = System.currentTimeMillis() - startTime;
        return (int) Math.max(0, (duration - elapsed) / 1000);
    }

    public boolean isGameOver() {
        return inProgress && (System.currentTimeMillis() - startTime) >= duration;
    }

    // Getters
    public String getCode() { return code; }
    public GameConfig getConfig() { return config; }
    public List<String> getPlayers() { return new ArrayList<>(players); }
    public boolean isInProgress() { return inProgress; }
    public int getPlayerCount() { return players.size(); }
    public String getScenario() { return config.getScenario(); }
}
