package com.f1pulse.backend.ai.integration;

import org.springframework.stereotype.Component;

import java.io.*;

@Component
public class PythonExecutor {

    public String runPredictionScript(String inputJson) {
        try {
            String pythonPath = "python"; // or full path if needed
            String scriptPath = "C:/projects/f1-pulse/backend/ml/predict.py";

            System.out.println("=== AI DEBUG START ===");
            System.out.println("Script Path: " + scriptPath);
            System.out.println("Input JSON: " + inputJson);

            // ✅ DO NOT PASS JSON AS ARGUMENT
            ProcessBuilder processBuilder = new ProcessBuilder(
                    pythonPath,
                    scriptPath
            );

            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            // 🔥 SEND JSON VIA STDIN (THIS FIXES EVERYTHING)
            BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream())
            );
            writer.write(inputJson);
            writer.flush();
            writer.close();

            // 🔥 READ OUTPUT
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            StringBuilder output = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            int exitCode = process.waitFor();

            System.out.println("Python Output: " + output);
            System.out.println("Exit Code: " + exitCode);
            System.out.println("=== AI DEBUG END ===");

            if (exitCode != 0) {
                throw new RuntimeException("Python failed: " + output);
            }

            return output.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error executing Python script: " + e.getMessage(), e);
        }
    }
}