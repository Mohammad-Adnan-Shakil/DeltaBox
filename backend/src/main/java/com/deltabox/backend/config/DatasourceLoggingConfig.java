package com.deltabox.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DatasourceLoggingConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatasourceLoggingConfig.class);

    @Value("${spring.datasource.url:NOT_SET}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:NOT_SET}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:NOT_SET}")
    private String datasourcePassword;

    @PostConstruct
    public void logDatasourceConfig() {
        logger.info("=== DATASOURCE CONFIGURATION VERIFICATION ===");
        logger.info("Datasource URL: {}", datasourceUrl);
        logger.info("Datasource Username: {}", datasourceUsername);
        logger.info("Datasource Password: {}", datasourcePassword != null && !datasourcePassword.equals("NOT_SET") ? "***SET***" : "NOT_SET");
        
        // WARNING: If username is "update", that's the problem!
        if ("update".equals(datasourceUsername)) {
            logger.error("!!! CRITICAL ERROR: Username is 'update' - this will cause authentication failure !!!");
        }
        
        if (datasourceUrl.equals("NOT_SET")) {
            logger.error("!!! CRITICAL ERROR: Datasource URL is not set !!!");
        }
        
        if (datasourceUsername.equals("NOT_SET")) {
            logger.error("!!! CRITICAL ERROR: Datasource username is not set !!!");
        }
        
        logger.info("=== END DATASOURCE CONFIGURATION VERIFICATION ===");
    }
}
