package edu.eci.arsw.bomberman.controller;

import edu.eci.arsw.bomberman.model.*;
import edu.eci.arsw.bomberman.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {
    private final GameService gameService;
    private final ConcurrentHashMap<String, GameBoard> gameBoards;

    public GameController(GameService gameService) {
        this.gameService = gameService;
        this.gameBoards = new ConcurrentHashMap<>();
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGame(@RequestBody GameConfig config) {
        try {
            GameSession session = gameService.createGame(config);
            GameBoard board = new GameBoard(
                    config.getScenario(),
                    15, 13, config.getBlockCount()
            );
            board.addPlayer(config.getHost());

            gameBoards.put(session.getCode(), board);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGame(
            @RequestParam String code,
            @RequestParam String playerId) {

        try {
            GameSession session = gameService.joinGame(code, playerId);
            GameBoard board = gameBoards.get(code);

            if (board == null || !board.addPlayer(playerId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not join game"));
            }

            return ResponseEntity.ok(Map.of(
                    "boardState", board.getBoardState(),
                    "players", board.getPlayers()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(@RequestParam String code) {
        try {
            GameSession session = gameService.getGameInfo(code);
            if (session == null || !session.startGame()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not start game"));
            }

            return ResponseEntity.ok(Map.of(
                    "status", "Game started",
                    "remainingTime", session.getRemainingTime()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/state")
    public ResponseEntity<?> getGameState(@RequestParam String code) {
        GameSession session = gameService.getGameInfo(code);
        GameBoard board = gameBoards.get(code);

        if (session == null || board == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Game not found"));
        }

        return ResponseEntity.ok(Map.of(
                "boardState", board.getBoardState(),
                "players", board.getPlayers(),
                "scenario", session.getScenario(),
                "isRunning", session.isInProgress(),
                "remainingTime", session.getRemainingTime()
        ));
    }

    @PostMapping("/move")
    public ResponseEntity<?> movePlayer(
            @RequestParam String code,
            @RequestParam String playerId,
            @RequestParam String direction) {

        GameBoard board = gameBoards.get(code);
        if (board == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Game not found"));
        }

        int dx = 0, dy = 0;
        switch (direction.toUpperCase()) {
            case "UP": dy = -1; break;
            case "DOWN": dy = 1; break;
            case "LEFT": dx = -1; break;
            case "RIGHT": dx = 1; break;
            default: return ResponseEntity.badRequest().body(Map.of("error", "Invalid direction"));
        }

        board.movePlayer(playerId, dx, dy);
        return ResponseEntity.ok(Map.of(
                "boardState", board.getBoardState()
        ));
    }
}
