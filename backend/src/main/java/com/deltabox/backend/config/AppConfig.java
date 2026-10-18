package com.deltabox.backend.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate(
            @Value("${ml.service.url}") String mlServiceUrl,
            @Value("${ml.service.token:}") String mlServiceToken) {
        RestTemplate restTemplate = new RestTemplate();
        String normalizedMlServiceUrl = mlServiceUrl.replaceAll("/+$", "");
        ClientHttpRequestInterceptor mlTokenInterceptor = (request, body, execution) -> {
            if (request.getURI().toString().startsWith(normalizedMlServiceUrl + "/")) {
                request.getHeaders().set("X-Internal-Token", mlServiceToken);
            }
            return execution.execute(request, body);
        };
        restTemplate.getInterceptors().add(mlTokenInterceptor);
        return restTemplate;
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatBindOnInitCustomizer() {
        return factory -> factory.addConnectorCustomizers(
            connector -> connector.setProperty("bindOnInit", "true"));
    }
}
