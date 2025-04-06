package edu.eci.arsw.bomberman.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                                .disable() // Disable CSRF for API endpoints
                        // .ignoringRequestMatchers("/api/**") // Alternative: disable CSRF only for API
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/game.html", "/**", "/**", "/images/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll() // Allow auth endpoints
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/")
                        .permitAll()
                )
                .logout(logout -> logout
                        .permitAll()
                );

        return http.build();
    }
}
