package edu.eci.arsw.bomberman.repository;

import edu.eci.arsw.bomberman.model.User;
import org.springframework.stereotype.Repository;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Repository
public class UserRepository {
    private final ConcurrentMap<String, User> users = new ConcurrentHashMap<>();

    public boolean existsByUsername(String username) {
        return users.containsKey(username);
    }

    public User findByUsername(String username) {
        return users.get(username);
    }

    public void save(User user) {
        users.put(user.getUsername(), user);
    }
}
