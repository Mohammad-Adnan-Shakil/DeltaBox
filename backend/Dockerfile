# Multi-stage build for DeltaBox Spring Boot backend (GraalVM Native Image)
# Stage 1: Native compilation with GraalVM
FROM ghcr.io/graalvm/graalvm-community:21 AS builder

WORKDIR /build

# Copy Maven wrapper and build config first (for layer caching)
COPY mvnw .mvn pom.xml ./
RUN chmod +x mvnw && ./mvnw -N dependency:go-offline 2>&1 || true

# Copy source
COPY src ./src

# Build native image (AOT compilation — slow but runs during Render's BUILD phase)
RUN ./mvnw -Pnative native:compile -DskipTests

# Stage 2: Minimal runtime — no JVM needed
FROM debian:12-slim

WORKDIR /app

# ca-certificates for HTTPS calls (Groq API, ML service)
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*

# Copy the native binary from builder
COPY --from=builder /build/target/backend .

# Expose the application port
EXPOSE 8080

# Run the native binary directly (no JVM, no java command)
ENTRYPOINT ["./backend"]
