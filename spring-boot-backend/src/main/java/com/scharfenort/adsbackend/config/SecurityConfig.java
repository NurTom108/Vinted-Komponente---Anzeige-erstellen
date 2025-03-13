package com.scharfenort.adsbackend.config;

import com.scharfenort.adsbackend.filter.JwtTokenFilter;
import com.scharfenort.adsbackend.filter.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

/*
  Überblick:
   CSRF wird ausgeschaltet (wegen JWT und stateles).
   CORS wird aktiviert.
   bestimmte Endpoints (wie Login und GET-Anfragen für Bilder/Videos) sind öffentlich.
   Alle anderen Endpoints brauchen eine gültigen JWT.
   JWT-Filter wird vor dem Standard-Authentifizierungsfilter eingebaut.
 */
@Configuration
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    // Konstruktor: Holt den JwtTokenProvider rein.
    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // Hier wird der SecurityFilterChain gebaut, der unsere Sicherheitsregeln festlegt.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())  //
                .cors(withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // Jeder darf /auth/login POST ansteuern
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        // GET-Anfragen für Bilder und Videos sind auch öffentlich
                        .requestMatchers(HttpMethod.GET, "/api/ads/images/**", "/api/ads/videos/**").permitAll()
                        // Alle anderen Anfragen brauchen einen gültigen JWT
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        // Der JWT-Filter kommt vor dem Standard-Authentifizierungsfilter
        http.addFilterBefore(new JwtTokenFilter(jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
