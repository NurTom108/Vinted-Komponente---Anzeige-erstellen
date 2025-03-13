package com.scharfenort.adsbackend;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AdsBackendApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		// Setze die Werte als System-Properties, damit Spring sie als Umgebungsvariablen erkennen kann:
		System.setProperty("AZURE_STORAGE_CONNECTION_STRING", dotenv.get("AZURE_STORAGE_CONNECTION_STRING"));
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		SpringApplication.run(AdsBackendApplication.class, args);
	}
}


