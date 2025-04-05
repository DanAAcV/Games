package edu.eci.arsw.bomberman.service;

import edu.eci.arsw.bomberman.model.User;
import edu.eci.arsw.bomberman.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean registerUser(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            return false;
        }
        userRepository.save(new User(username, password));
        return true;
    }

    public boolean authenticateUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getPassword().equals(password);
    }
}
