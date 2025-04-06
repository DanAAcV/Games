package edu.eci.arsw.bomberman.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/**")  // Maneja todas las rutas
                .addResourceLocations("classpath:/static/")  // Busca en /src/main/resources/static/
                .setCachePeriod(0);  // Opcional: desactiva cache en desarrollo
    }
}
