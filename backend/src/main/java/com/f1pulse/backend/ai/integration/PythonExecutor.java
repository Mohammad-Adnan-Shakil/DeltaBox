package com.f1pulse.backend.ai.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
public class PythonExecutor {

    private static final Logger logger = LoggerFactory.getLogger(PythonExecutor.class);

    public String runPredictionScript(String inputJson) {
        try {
            String pythonPath = "python";
            String scriptPath = "C:/projects/f1-pulse/backend/ml/predict.py";

            logger.info("=== AI DEBUG START ===");
            logger.info("Script Path: {}", scriptPath);
            logger.info("Input JSON: {}", inputJson);

            ProcessBuilder processBuilder = new ProcessBuilder(
                    pythonPath,
                    scriptPath,
                    inputJson
            );

            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            StringBuilder output = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            int exitCode = process.waitFor();

            logger.info("Python Output: {}", output);
            logger.info("Exit Code: {}", exitCode);
            logger.info("=== AI DEBUG END ===");

            if (exitCode != 0) {
                logger.error("Python execution failed: {}", output);
                throw new RuntimeException("Python failed: " + output);
            }

            return output.toString();

        } catch (Exception e) {
            logger.error("Error executing Python script", e);
            throw new RuntimeException("Error executing Python script", e);
        }
    }
}