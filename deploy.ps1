# Stock Consultant Deployment Script for Windows PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

Write-Host "🚀 Stock Consultant Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Show-Help {
    Write-Host "Stock Consultant Deployment Script for Windows" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev         Set up development environment"
    Write-Host "  build       Build for production"
    Write-Host "  docker      Deploy with Docker"
    Write-Host "  compose     Deploy with Docker Compose"
    Write-Host "  test        Test deployment"
    Write-Host "  cleanup     Clean up Docker resources"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 dev      # Set up development environment"
    Write-Host "  .\deploy.ps1 docker   # Deploy with Docker"
    Write-Host "  .\deploy.ps1 compose  # Deploy with Docker Compose"
    Write-Host "  .\deploy.ps1 test     # Test deployment"
}

function Setup-Dev {
    Write-Status "Setting up development environment..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Status "Node.js is installed: $nodeVersion ✓"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js first."
        return
    }
    
    # Check Python
    try {
        $pythonVersion = python --version
        Write-Status "Python is installed: $pythonVersion ✓"
    }
    catch {
        Write-Error "Python is not installed. Please install Python 3 first."
        return
    }
    
    # Install frontend dependencies
    Set-Location "frontend"
    npm install
    Set-Location ".."
    
    # Install backend dependencies
    Set-Location "backend"
    pip install -r requirements.txt
    Set-Location ".."
    
    Write-Status "Development environment ready ✓"
    Write-Status "Run 'npm run dev' in frontend/ to start frontend"
    Write-Status "Run 'uvicorn main:app --reload' in backend/ to start backend"
}

function Build-Production {
    Write-Status "Building for production..."
    
    # Build frontend
    Set-Location "frontend"
    npm install
    npm run build
    Set-Location ".."
    
    # Install backend dependencies
    Set-Location "backend"
    pip install -r requirements.txt
    Set-Location ".."
    
    Write-Status "Production build complete ✓"
}

function Deploy-Docker {
    Write-Status "Deploying with Docker..."
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Status "Docker is installed: $dockerVersion ✓"
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        return
    }
    
    # Build the image
    Write-Status "Building Docker image..."
    docker build -t stock-consultant .
    
    # Stop existing container if running
    $existingContainer = docker ps -q -f name=stock-consultant-app
    if ($existingContainer) {
        Write-Status "Stopping existing container..."
        docker stop stock-consultant-app
        docker rm stock-consultant-app
    }
    
    # Run the container
    Write-Status "Starting new container..."
    docker run -d --name stock-consultant-app -p 8000:8000 -e PYTHONPATH=/app stock-consultant
    
    Write-Status "Application deployed with Docker ✓"
    Write-Status "Access your app at: http://localhost:8000"
}

function Deploy-Compose {
    Write-Status "Deploying with Docker Compose..."
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Status "Docker is installed: $dockerVersion ✓"
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        return
    }
    
    # Start services
    Write-Status "Starting services with Docker Compose..."
    docker-compose up -d
    
    Write-Status "Application deployed with Docker Compose ✓"
    Write-Status "Access your app at: http://localhost:8000"
    Write-Status "Access frontend at: http://localhost:3000"
}

function Cleanup {
    Write-Status "Cleaning up..."
    
    docker stop stock-consultant-app 2>$null
    docker rm stock-consultant-app 2>$null
    docker rmi stock-consultant 2>$null
    docker-compose down 2>$null
    
    Write-Status "Cleanup complete ✓"
}

function Test-Deployment {
    Write-Status "Testing deployment..."
    
    # Test backend health
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
        Write-Status "Backend health check: $($response.status) ✓"
    }
    catch {
        Write-Error "Backend health check failed. Is the backend running?"
        return
    }
    
    # Test API endpoint
    try {
        $testPortfolio = @{
            portfolio = @(
                @{
                    symbol = "AAPL"
                    shares = 10
                }
            )
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/analyze" -Method Post -Body $testPortfolio -ContentType "application/json"
        Write-Status "API test successful ✓"
        Write-Status "Portfolio value: $($response.portfolio_value)"
    }
    catch {
        Write-Error "API test failed: $($_.Exception.Message)"
    }
}

# Main script logic
switch ($Command.ToLower()) {
    "dev" { Setup-Dev }
    "build" { Build-Production }
    "docker" { Deploy-Docker }
    "compose" { Deploy-Compose }
    "test" { Test-Deployment }
    "cleanup" { Cleanup }
    "help" { Show-Help }
    default { 
        Write-Error "Unknown command: $Command"
        Show-Help
    }
}