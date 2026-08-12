# Color output helper functions
function Log-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Log-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Log-Warning($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Log-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Navigate to docker and gateways directories
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$dockerDir = Join-Path $projectDir "docker"
$gatewayDir = Join-Path $projectDir "gateways"
$originalDir = Get-Location

# Start Gateway
function Start-Gateway {
    Log-Info "Starting KONG API Gateway..."
    Push-Location $gatewayDir
    docker compose -p gateway -f gateway.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "KONG API Gateway started successfully."
    } else {
        Log-Error "KONG API Gateway start failed."
    }
    Pop-Location
}

# Start Dependencies
function Start-Deps {
    Log-Info "Starting Microservices Dependencies..."
    Push-Location $dockerDir
    docker compose -p micro-services-deps -f deps.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Dependencies started successfully."
    } else {
        Log-Error "Dependencies start failed."
    }
    Pop-Location
}

# Start Kafka Brokers
function Start-Kafka {
    Log-Info "Starting Kafka Brokers..."
    Push-Location $dockerDir
    docker compose -p kafka -f kafka.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Kafka Brokers started successfully."
    } else {
        Log-Error "Kafka Brokers start failed."
    }
    Pop-Location
}

# Start Application
function Start-App {
    Log-Info "Starting Application Services..."
    Push-Location $dockerDir
    docker compose -p micro-services-app -f app.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Application started successfully."
    } else {
        Log-Error "Application start failed."
    }
    Pop-Location
}

# Start All
function Start-All {
    Write-Host ""
    Log-Info "Starting all services in sequence..."
    Write-Host ""
    Start-Gateway
    Write-Host ""
    Start-Deps
    Write-Host ""
    Start-Kafka
    Write-Host ""
    Start-App
    Write-Host ""
}

Clear-Host
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Microservices Startup Manager" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Start All Services" -ForegroundColor Yellow
Write-Host "  2. Start Gateway Only"
Write-Host "  3. Start Dependencies Only"
Write-Host "  4. Start Kafka Brokers Only"
Write-Host "  5. Start Application Only"
Write-Host "  6. Start Custom Services (comma-separated)"
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter your choice"

switch ($choice) {
    "1" { Start-All }
    "2" { Start-Gateway }
    "3" { Start-Deps }
    "4" { Start-Kafka }
    "5" { Start-App }
    "6" {
        Write-Host ""
        $services = Read-Host "Enter services to start (e.g., gateway,deps,app)"
        Write-Host ""
        $list = $services -split ","
        foreach ($svc in $list) {
            $svc = $svc.Trim()
            switch ($svc.ToLower()) {
                "gateway" { Start-Gateway; Write-Host "" }
                "deps"    { Start-Deps; Write-Host "" }
                "app"     { Start-App; Write-Host "" }
                default { Log-Warning "Unknown service: $svc" }
            }
        }
    }
    default { Log-Error "Invalid option. Please enter 1-5." }
}

Write-Host "All operations completed!" -ForegroundColor Green
Write-Host ""