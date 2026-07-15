package com.deltabox.backend.config;

import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.embedded.tomcat.TomcatWebServer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;

@Configuration
public class TomcatConfig {

    private static final Logger log = LoggerFactory.getLogger(TomcatConfig.class);

    @Bean
    public TomcatServletWebServerFactory tomcatServletWebServerFactory() {
        return new TomcatServletWebServerFactory() {
            @Override
            public TomcatWebServer getWebServer(ServletContextInitializer... initializers) {
                TomcatWebServer server = (TomcatWebServer) super.getWebServer(initializers);
                eagerlyBindPort(server);
                return server;
            }

            private void eagerlyBindPort(TomcatWebServer server) {
                try {
                    Method addConnectors = TomcatWebServer.class
                            .getDeclaredMethod("addPreviouslyRemovedConnectors");
                    addConnectors.setAccessible(true);
                    addConnectors.invoke(server);
                    log.info("Tomcat port bound eagerly for Render port scanner");
                } catch (Exception e) {
                    log.warn("Could not eagerly bind Tomcat port (fallback to deferred): {}", e.getMessage());
                }
            }
        };
    }
}
