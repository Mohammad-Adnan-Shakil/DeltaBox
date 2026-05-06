# DeltaBox API Verification Tests
# Tests both production blockers: Favorite Driver and Delta Analyst

Write-Host "🧪 DeltaBox API Verification Tests" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Configuration
$BACKEND_URL = "http://localhost:8080"
$FRONTEND_URL = "http://localhost:5173"
$TEST_EMAIL = "test@deltabox.app"
$TEST_PASSWORD = "TestPassword123!"

# Colors
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$infoColor = "Cyan"

# Helper function for API calls
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$AuthToken
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }
    
    try {
        $params = @{
            Uri = "$BACKEND_URL$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $errorBody = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        return @{ Success = $false; StatusCode = $statusCode; Error = $errorBody; Exception = $_.Exception.Message }
    }
}

# ============================================
# PHASE 1: Backend Health Check
# ============================================
Write-Host "PHASE 1: Backend Health Check" -ForegroundColor $infoColor
Write-Host "-----" -ForegroundColor $infoColor

$health = Invoke-ApiCall "GET" "/api/health" $null $null
if ($health.Success) {
    Write-Host "✅ Backend is running" -ForegroundColor $successColor
    Write-Host "   Status: $($health.Data.status)" -ForegroundColor $successColor
} else {
    Write-Host "❌ Backend is NOT running" -ForegroundColor $errorColor
    Write-Host "   Error: $($health.StatusCode)" -ForegroundColor $errorColor
    Write-Host "   Make sure backend is started with: .\start-backend.ps1" -ForegroundColor $warningColor
    exit 1
}

Write-Host ""

# ============================================
# PHASE 2: User Registration & Login
# ============================================
Write-Host "PHASE 2: User Registration & Authentication" -ForegroundColor $infoColor
Write-Host "-----" -ForegroundColor $infoColor

# Register test user
Write-Host "Registering test user..." -ForegroundColor $infoColor
$registerPayload = @{
    username = "testuser_$(Get-Random)"
    email = "test_$(Get-Random)@deltabox.app"
    password = $TEST_PASSWORD
}

$registerResult = Invoke-ApiCall "POST" "/api/auth/register" $registerPayload $null
if ($registerResult.Success) {
    Write-Host "✅ User registration successful" -ForegroundColor $successColor
    $testEmail = $registerPayload.email
    Write-Host "   Email: $testEmail" -ForegroundColor $successColor
} else {
    Write-Host "❌ User registration failed" -ForegroundColor $errorColor
    Write-Host "   Error: $($registerResult.Error.message)" -ForegroundColor $errorColor
    exit 1
}

# Login
Write-Host "Logging in user..." -ForegroundColor $infoColor
$loginPayload = @{
    email = $testEmail
    password = $TEST_PASSWORD
}

$loginResult = Invoke-ApiCall "POST" "/api/auth/login" $loginPayload $null
if ($loginResult.Success) {
    Write-Host "✅ User login successful" -ForegroundColor $successColor
    $authToken = $loginResult.Data.token
    if (-not $authToken) {
        $authToken = $loginResult.Data.data.token
    }
    Write-Host "   Token received (length: $($authToken.Length) chars)" -ForegroundColor $successColor
} else {
    Write-Host "❌ User login failed" -ForegroundColor $errorColor
    Write-Host "   Error: $($loginResult.Error.message)" -ForegroundColor $errorColor
    exit 1
}

Write-Host ""

# ============================================
# PHASE 3: Favorite Driver Feature (BUG FIX #1)
# ============================================
Write-Host "PHASE 3: Favorite Driver Feature (BUG FIX #1)" -ForegroundColor $infoColor
Write-Host "-----" -ForegroundColor $infoColor
Write-Host "Testing: PUT /api/user/profile" -ForegroundColor $infoColor

# Get current profile
Write-Host "Getting current user profile..." -ForegroundColor $infoColor
$profileGetResult = Invoke-ApiCall "GET" "/api/user/profile" $null $authToken
if ($profileGetResult.Success) {
    Write-Host "✅ Profile fetched successfully" -ForegroundColor $successColor
    $profile = $profileGetResult.Data.data
    Write-Host "   Username: $($profile.username)" -ForegroundColor $successColor
    Write-Host "   Current favorite driver: $($profile.favoriteDriver)" -ForegroundColor $successColor
} else {
    Write-Host "⚠️  Profile fetch returned: $($profileGetResult.StatusCode)" -ForegroundColor $warningColor
}

# Update favorite driver
Write-Host "Updating favorite driver..." -ForegroundColor $infoColor
$updatePayload = @{
    favoriteDriver = "VER"
}

$profileUpdateResult = Invoke-ApiCall "PUT" "/api/user/profile" $updatePayload $authToken
if ($profileUpdateResult.Success) {
    Write-Host "✅ BUG #1 FIXED: Favorite driver updated successfully!" -ForegroundColor $successColor
    Write-Host "   New favorite: $($profileUpdateResult.Data.data.favoriteDriver)" -ForegroundColor $successColor
} else {
    Write-Host "❌ BUG #1 NOT FIXED: Favorite driver update failed" -ForegroundColor $errorColor
    Write-Host "   Status: $($profileUpdateResult.StatusCode)" -ForegroundColor $errorColor
    Write-Host "   Error: $($profileUpdateResult.Error.message)" -ForegroundColor $errorColor
    
    if ($profileUpdateResult.StatusCode -eq 405) {
        Write-Host "   💡 Issue: HTTP 405 (Method Not Supported) - Endpoint mapping may be incorrect" -ForegroundColor $warningColor
    } elseif ($profileUpdateResult.StatusCode -eq 401) {
        Write-Host "   💡 Issue: HTTP 401 (Unauthorized) - Auth token may be invalid" -ForegroundColor $warningColor
    }
}

# Verify persistence
Write-Host "Verifying persistence (refresh)..." -ForegroundColor $infoColor
Start-Sleep -Seconds 1
$profileVerifyResult = Invoke-ApiCall "GET" "/api/user/profile" $null $authToken
if ($profileVerifyResult.Success) {
    $favoriteDriver = $profileVerifyResult.Data.data.favoriteDriver
    if ($favoriteDriver -eq "VER") {
        Write-Host "✅ Favorite driver persisted correctly!" -ForegroundColor $successColor
    } else {
        Write-Host "❌ Favorite driver NOT persisted (got: $favoriteDriver)" -ForegroundColor $errorColor
    }
} else {
    Write-Host "⚠️  Could not verify persistence" -ForegroundColor $warningColor
}

Write-Host ""

# ============================================
# PHASE 4: Delta Analyst AI Chat (BUG FIX #2)
# ============================================
Write-Host "PHASE 4: Delta Analyst AI Chat (BUG FIX #2)" -ForegroundColor $infoColor
Write-Host "-----" -ForegroundColor $infoColor
Write-Host "Testing: POST /api/ai/delta-analyst/chat" -ForegroundColor $infoColor

# Prepare telemetry data (sample)
$telemetryPayload = @{
    driver1 = "VER"
    driver2 = "LEC"
    speedData = @{
        VER = @(320, 325, 318, 330)
        LEC = @(315, 322, 320, 328)
    }
    throttleData = @{
        VER = @(0.85, 0.90, 0.75, 0.95)
        LEC = @(0.80, 0.88, 0.80, 0.92)
    }
    brakeData = @{
        VER = @(0.65, 0.70, 0.75, 0.60)
        LEC = @(0.70, 0.72, 0.78, 0.65)
    }
    gearData = @{
        VER = @(4, 5, 3, 6)
        LEC = @(4, 5, 3, 6)
    }
    sectorDelta = @{
        S1 = -0.15
        S2 = +0.08
        S3 = -0.23
    }
    userMessage = "Why is Verstappen faster than Leclerc in sectors 1 and 3?"
}

Write-Host "Sending telemetry analysis request..." -ForegroundColor $infoColor
$deltaAnalystResult = Invoke-ApiCall "POST" "/api/ai/delta-analyst/chat" $telemetryPayload $authToken

if ($deltaAnalystResult.Success) {
    Write-Host "✅ BUG #2 FIXED: Delta Analyst responded successfully!" -ForegroundColor $successColor
    $response = $deltaAnalystResult.Data.data
    
    if ($response -and $response.Length -gt 0) {
        $preview = $response.Substring(0, [Math]::Min(150, $response.Length))
        Write-Host "   Response: $preview..." -ForegroundColor $successColor
        Write-Host "   ✅ Groq API integration is working!" -ForegroundColor $successColor
    } else {
        Write-Host "⚠️  Response was empty" -ForegroundColor $warningColor
    }
} else {
    Write-Host "❌ BUG #2 NOT FIXED: Delta Analyst call failed" -ForegroundColor $errorColor
    Write-Host "   Status: $($deltaAnalystResult.StatusCode)" -ForegroundColor $errorColor
    
    if ($deltaAnalystResult.StatusCode -eq 500) {
        Write-Host "   💡 Issue: HTTP 500 - Check backend logs for Groq API errors" -ForegroundColor $warningColor
        Write-Host "   💡 Verify GROQ_API_KEY environment variable is set" -ForegroundColor $warningColor
    } elseif ($deltaAnalystResult.StatusCode -eq 401) {
        Write-Host "   💡 Issue: HTTP 401 - Auth token invalid" -ForegroundColor $warningColor
    } else {
        Write-Host "   Error details: $($deltaAnalystResult.Exception)" -ForegroundColor $errorColor
    }
}

Write-Host ""

# ============================================
# Summary
# ============================================
Write-Host "✨ Verification Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. If both tests passed: Deploy to Render production" -ForegroundColor Cyan
Write-Host "2. If tests failed: Check backend logs and environment variables" -ForegroundColor Cyan
Write-Host "3. Frontend testing: Run full end-to-end tests" -ForegroundColor Cyan
Write-Host ""
