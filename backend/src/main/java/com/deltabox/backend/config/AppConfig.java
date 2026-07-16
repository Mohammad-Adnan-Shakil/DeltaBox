package com.deltabox.backend.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatBindOnInitCustomizer() {
        return factory -> factory.addConnectorCustomizers(
            connector -> connector.setProperty("bindOnInit", "true"));
    }
}
