package com.scharfenort.adsbackend.controller;

import com.scharfenort.adsbackend.filter.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Überblick:
// Bietet einen einfachen Fake-Login, bei dem anhand eines Benutzernamens ein JWT erstellt wird.
// Es wird keine echte Passwortprüfung durchgeführt.
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final JwtTokenProvider tokenProvider;

    // Konstruktor: Hier wird der JWT-Provider reingereicht.
    public AuthController(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    // Endpoint zum Einloggen. Es wird ein JWT basierend auf dem übergebenen Benutzernamen erstellt.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // immer ROLL_USER
        var roles = List.of("ROLE_USER");
        String token = tokenProvider.createToken(request.username, roles);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    // Einfacher Request, der den Benutzernamen enthält (hier könnte auch ein Passwort stehen).
    public static class LoginRequest {
        public String username;
    }

    // Antwort-Objekt, das den erstellten Token enthält.
    public static class AuthResponse {
        public String token;
        public AuthResponse(String token) { this.token = token; }
    }
}
