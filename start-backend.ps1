# DeltaBox Backend Startup Script for Windows PowerShell
# This script starts the Spring Boot backend with all required environment variables

# Stop on any errors
$ErrorActionPreference = "Stop"

Write-Host "🚀 DeltaBox Backend Startup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the backend directory
if (-not (Test-Path ".\pom.xml")) {
    Write-Host "❌ Error: pom.xml not found. Please run from backend directory." -ForegroundColor Red
    exit 1
}

# ==========================================
# OPTION 1: PostgreSQL Local (Docker)
# ==========================================
Write-Host ""
Write-Host "📦 Database Setup Options:" -ForegroundColor Cyan
Write-Host "1. Using Docker PostgreSQL (Recommended for Windows)" -ForegroundColor Cyan
Write-Host "2. Using Existing PostgreSQL (if already installed)" -ForegroundColor Cyan
Write-Host "3. Using Render Production Database" -ForegroundColor Cyan
Write-Host ""

$dbOption = Read-Host "Choose database option (1-3, default: 1)"
if ([string]::IsNullOrWhiteSpace($dbOption)) { $dbOption = "1" }

# PostgreSQL Connection Details (will be set based on option)
$pgHost = ""
$pgPort = ""
$pgDatabase = "deltabox"
$pgUsername = "postgres"
$pgPassword = ""

switch ($dbOption) {
    "1" {
        Write-Host "🐳 Starting PostgreSQL in Docker..." -ForegroundColor Yellow
        
        # Check if Docker is running
        try {
            docker ps | Out-Null
            Write-Host "✅ Docker is running" -ForegroundColor Green
        } catch {
            Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
            exit 1
        }
        
        # Kill existing PostgreSQL container if running
        $existingContainer = docker ps -a --format '{{.Names}}' | Select-String "deltabox-postgres"
        if ($existingContainer) {
            Write-Host "Stopping existing PostgreSQL container..." -ForegroundColor Yellow
            docker stop deltabox-postgres 2>&1 | Out-Null
            docker rm deltabox-postgres 2>&1 | Out-Null
        }
        
        # Start PostgreSQL container
        docker run -d `
            --name deltabox-postgres `
            -e POSTGRES_USER=$pgUsername `
            -e POSTGRES_PASSWORD="postgres123" `
            -e POSTGRES_DB=$pgDatabase `
            -p 5432:5432 `
            postgres:15-alpine | Out-Null
        
        Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Verify connection
        $maxAttempts = 10
        $attempt = 0
        while ($attempt -lt $maxAttempts) {
            try {
                docker exec deltabox-postgres pg_isready -U $pgUsername | Out-Null
                Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
                break
            } catch {
                $attempt++
                if ($attempt -lt $maxAttempts) {
                    Write-Host "⏳ Waiting... ($attempt/$maxAttempts)" -ForegroundColor Yellow
                    Start-Sleep -Seconds 2
                }
            }
        }
        
        $pgHost = "localhost"
        $pgPort = "5432"
        $pgPassword = "postgres123"
    }
    
    "2" {
        Write-Host "🔧 Using existing PostgreSQL installation" -ForegroundColor Yellow
        $pgHost = Read-Host "Enter PostgreSQL host (default: localhost)"
        if ([string]::IsNullOrWhiteSpace($pgHost)) { $pgHost = "localhost" }
        
        $pgPort = Read-Host "Enter PostgreSQL port (default: 5432)"
        if ([string]::IsNullOrWhiteSpace($pgPort)) { $pgPort = "5432" }
        
        $pgUsername = Read-Host "Enter PostgreSQL username (default: postgres)"
        if ([string]::IsNullOrWhiteSpace($pgUsername)) { $pgUsername = "postgres" }
        
        $pgPassword = Read-Host "Enter PostgreSQL password" -AsSecureString
        $pgPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemAlloc($pgPassword))
    }
    
    "3" {
        Write-Host "☁️ Using Render Production Database" -ForegroundColor Yellow
        $renderUrl = Read-Host "Enter Render PostgreSQL URL (format: postgresql://user:pass@host:port/db)"
        if ([string]::IsNullOrWhiteSpace($renderUrl)) {
            Write-Host "❌ Render database URL required" -ForegroundColor Red
            exit 1
        }
        
        # Parse Render URL: postgresql://user:pass@host:port/db
        $pattern = "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)"
        if ($renderUrl -match $pattern) {
            $pgUsername = $matches[1]
            $pgPassword = $matches[2]
            $pgHost = $matches[3]
            $pgPort = $matches[4]
            $pgDatabase = $matches[5]
        } else {
            Write-Host "❌ Invalid Render URL format" -ForegroundColor Red
            exit 1
        }
    }
    
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

# ==========================================
# Environment Variables
# ==========================================
Write-Host ""
Write-Host "📝 Setting Environment Variables" -ForegroundColor Cyan

# Database URL (JDBC format for Spring)
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://$pgHost`:$pgPort/$pgDatabase"
$env:SPRING_DATASOURCE_USERNAME = $pgUsername
$env:SPRING_DATASOURCE_PASSWORD = $pgPassword

# Spring Profile
$env:SPRING_PROFILES_ACTIVE = "production"

# JWT Secret (generate secure one for production)
$env:JWT_SECRET_KEY = Read-Host "Enter JWT_SECRET_KEY (or press Enter for test key)"
if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET_KEY)) {
    $env:JWT_SECRET_KEY = "test-secret-key-deltabox-2026-$(Get-Random)"
}

# ML Service URL
$env:ML_SERVICE_URL = "http://localhost:5000"

# Groq API Key (REQUIRED for Delta Analyst)
$env:GROQ_API_KEY = Read-Host "Enter GROQ_API_KEY (Required for Delta Analyst AI)"
if ([string]::IsNullOrWhiteSpace($env:GROQ_API_KEY)) {
    Write-Host "⚠️  Warning: GROQ_API_KEY not set. Delta Analyst AI will not work." -ForegroundColor Yellow
    Write-Host "    Get your Groq API key from: https://console.groq.com/keys" -ForegroundColor Yellow
}

# Frontend URL (for CORS)
$env:FRONTEND_URL = "http://localhost:5173"

# Database URL format
Write-Host "✅ Database URL: $env:SPRING_DATASOURCE_URL" -ForegroundColor Green
Write-Host "✅ Profile: production" -ForegroundColor Green
Write-Host "✅ JWT Secret: set" -ForegroundColor Green
if (-not [string]::IsNullOrWhiteSpace($env:GROQ_API_KEY)) {
    Write-Host "✅ Groq API Key: set" -ForegroundColor Green
} else {
    Write-Host "⚠️  Groq API Key: NOT SET" -ForegroundColor Yellow
}

# ==========================================
# Run Backend
# ==========================================
Write-Host ""
Write-Host "🚀 Starting Spring Boot Backend..." -ForegroundColor Green
Write-Host "Backend will run on: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Documentation: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8080/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints to test:" -ForegroundColor Cyan
Write-Host "  📍 Profile Update: PUT /api/user/profile" -ForegroundColor Cyan
Write-Host "  📍 Delta Analyst: POST /api/ai/delta-analyst/chat" -ForegroundColor Cyan
Write-Host ""

.\mvnw.cmd spring-boot:run
