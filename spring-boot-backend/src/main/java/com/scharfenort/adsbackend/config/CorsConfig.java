package com.scharfenort.adsbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Erlaubt CORS für alle Endpunkte
                        .allowedOrigins("http://localhost:3000") // Erlaubt Anfragen von deinem React-Frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE") // Erlaubte Methoden
                        .allowedHeaders("*"); // Erlaubt alle Header
            }
        };
    }
}
