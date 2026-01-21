package com.wissen.ims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class WissenImsApplication {

    public static void main(String[] args) {
        SpringApplication.run(WissenImsApplication.class, args);
    }
}
