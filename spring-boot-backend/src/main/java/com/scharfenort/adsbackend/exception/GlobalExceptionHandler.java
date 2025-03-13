package com.scharfenort.adsbackend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/*
  Dieser Code fängt alle Fehler ab, die nicht anders behandelt werden.
  Außerdem gibt er eine spezielle Antwort, wenn eine Ressource nicht gefunden wird. (War für Testzwecke)
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Fängt alle nicht speziell abgefangenen Ausnahmen und gibt eine 500-Fehlermeldung zurück.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllExceptions(Exception ex) {
        // Fehler loggen, damit wir später sehen können, was schiefgelaufen ist
        logger.error("Unhandled exception: {}", ex.getMessage(), ex);
        // Eine allgemeine Fehlermeldung zurückgeben
        return new ResponseEntity<>("Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.", HttpStatus.INTERNAL_SERVER_ERROR);
    }


    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<String> handleNoResourceFound(NoResourceFoundException ex) {
        logger.warn("Requested resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Die angeforderte Ressource wurde nicht gefunden.");
    }
}
