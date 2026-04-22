package com.deltabox.backend.exception;

public class PythonExecutionException extends RuntimeException {

    public PythonExecutionException(String message) {
        super(message);
    }

    public PythonExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
