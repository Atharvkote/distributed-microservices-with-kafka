# Color output helper functions
function Log-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Log-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Log-Warning($msg) { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Log-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Start Kafka
function Start-Kafka {
    Log-Info "Starting Kafka Brokers..."
    docker compose -p kafka-brokers -f kafka.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Kafka Brokers started."
    } else {
        Log-Error "Kafka start failed."
    }
}

# Start Dependencies
function Start-Deps {
    Log-Info "Starting Microservices Dependencies..."
    docker compose -p micro-services-deps -f deps.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Dependencies started."
    } else {
        Log-Error "Dependencies start failed."
    }
}

# Start Application
function Start-App {
    Log-Info "Starting Application Services..."
    docker compose -p micro-services-app -f app.compose.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Application started."
    } else {
        Log-Error "Application start failed."
    }
}

# Start All
function Start-All {
    Log-Info "Starting all services..."
    Start-Kafka
    Start-Deps
    Start-App
}

Clear-Host
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Microservices Startup Manager" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "1. Start All" -ForegroundColor Yellow
Write-Host "2. Start Kafka"
Write-Host "3. Start Dependencies"
Write-Host "4. Start Application"
Write-Host "5. Start Multiple (kafka,deps,app)"
Write-Host "====================================" -ForegroundColor Cyan

$choice = Read-Host "Enter choice"

switch ($choice) {
    "1" { Start-All }
    "2" { Start-Kafka }
    "3" { Start-Deps }
    "4" { Start-App }
    "5" {
        $services = Read-Host "Enter services (comma separated)"
        $list = $services -split ","
        foreach ($svc in $list) {
            $svc = $svc.Trim()
            switch ($svc.ToLower()) {
                "kafka" { Start-Kafka }
                "deps"  { Start-Deps }
                "app"   { Start-App }
                default { Log-Warning "Unknown service: $svc" }
            }
        }
    }
    default { Log-Error "Invalid option." }
}

Write-Host "Done." -ForegroundColor Green