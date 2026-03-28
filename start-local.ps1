# ==========================================================
# Kiosk Vision - Local Startup Script (No Docker)
# Starts all backend services + frontend dev server
# ==========================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiosk Vision - Local Startup          " -ForegroundColor Cyan
Write-Host "  Starting all services without Docker  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Load .env file if it exists
$envFile = Join-Path $ProjectRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
    Write-Host "  OK Loaded .env file" -ForegroundColor Green
}

# Set defaults
$env:MONGO_URI = if ($env:MONGO_URI) { $env:MONGO_URI } else { "mongodb://localhost:27017" }
$env:JWT_SECRET = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "dev-secret-change-me" }

# Start backend services
Write-Host ""
Write-Host "Starting backend services..." -ForegroundColor Yellow

$services = @(
    @{ Name = "auth";      Port = 8001; Dir = "services\auth" },
    @{ Name = "orders";    Port = 8002; Dir = "services\orders" },
    @{ Name = "inventory"; Port = 8003; Dir = "services\inventory" },
    @{ Name = "ai";        Port = 8004; Dir = "services\ai" },
    @{ Name = "payment";   Port = 8005; Dir = "services\payment" },
    @{ Name = "crm";       Port = 8006; Dir = "services\crm" }
)

$jobs = @()

foreach ($svc in $services) {
    $svcDir = Join-Path $ProjectRoot $svc.Dir
    $port = $svc.Port
    $name = $svc.Name

    $job = Start-Job -Name "kiosk-$name" -ScriptBlock {
        param($root, $dir, $p, $mongoUri, $jwtSecret)

        $env:MONGO_URI = $mongoUri
        $env:JWT_SECRET = $jwtSecret
        $env:PYTHONPATH = $root

        Set-Location $root
        python -m uvicorn "app.main:app" --host 0.0.0.0 --port $p --reload --app-dir $dir
    } -ArgumentList $ProjectRoot, (Join-Path $ProjectRoot $svc.Dir), $port, $env:MONGO_URI, $env:JWT_SECRET

    $jobs += $job
    Write-Host "  OK $name service -> http://localhost:$port" -ForegroundColor Green
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting frontend dev server..." -ForegroundColor Yellow

$frontendDir = Join-Path $ProjectRoot "frontend"
$frontendJob = Start-Job -Name "kiosk-frontend" -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev
} -ArgumentList $frontendDir

$jobs += $frontendJob
Write-Host "  OK Frontend -> http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  OK All services started!              " -ForegroundColor Green
Write-Host "                                        " -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:3000      " -ForegroundColor Green
Write-Host "  Auth:      http://localhost:8001      " -ForegroundColor Green
Write-Host "  Orders:    http://localhost:8002      " -ForegroundColor Green
Write-Host "  Inventory: http://localhost:8003      " -ForegroundColor Green
Write-Host "  AI:        http://localhost:8004      " -ForegroundColor Green
Write-Host "  Payment:   http://localhost:8005      " -ForegroundColor Green
Write-Host "  CRM:       http://localhost:8006      " -ForegroundColor Green
Write-Host "                                        " -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop all services     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

try {
    while ($true) {
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                $jobName = $job.Name.Replace("kiosk-", "").ToUpper()
                $output | ForEach-Object { Write-Host "[$jobName] $_" }
            }
        }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    $jobs | ForEach-Object { Stop-Job -Job $_; Remove-Job -Job $_ -Force }
    Write-Host "  OK All services stopped." -ForegroundColor Green
}
