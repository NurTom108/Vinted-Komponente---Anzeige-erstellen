package com.scharfenort.adsbackend.filter;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/*
  Überblick:
  Dieser Code erstell, prüft und liest Informationen aus JWTs.
  Er verwendet den HS256-Algorithmus zur signatur und lädt den Schlüssel aus den Einstellungen.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    // Token-Gültigkeit
    private long validityInMilliseconds = 3600000;

    // Erzeugt ein JWT für einen Benutzer und dessen Rollen
    public String createToken(String userId, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(userId);
        claims.put("roles", roles);

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // Prüft, ob ein Token gültig und noch nicht abgelaufen ist
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Liest die Benutzer-ID (das Subject) aus dem Token aus
    public String getUserId(String token) {
        return Jwts.parser().setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
