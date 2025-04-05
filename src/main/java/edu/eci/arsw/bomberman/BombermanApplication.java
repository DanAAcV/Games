package edu.eci.arsw.bomberman;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "edu.eci.arsw.bomberman")
public class BombermanApplication {
    public static void main(String[] args) {
        SpringApplication.run(BombermanApplication.class, args);
    }
}
