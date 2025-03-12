package com.scharfenort.adsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AdsBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(AdsBackendApplication.class, args);
	}
}


