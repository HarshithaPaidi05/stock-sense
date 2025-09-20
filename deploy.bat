@echo off
echo 🚀 Stock Consultant Deployment Script
echo =====================================

if "%1"=="help" goto :help
if "%1"=="dev" goto :dev
if "%1"=="build" goto :build
if "%1"=="docker" goto :docker
if "%1"=="compose" goto :compose
if "%1"=="test" goto :test
if "%1"=="cleanup" goto :cleanup
goto :help

:help
echo.
echo Stock Consultant Deployment Script for Windows
echo =============================================
echo.
echo Usage: deploy.bat [COMMAND]
echo.
echo Commands:
echo   dev         Set up development environment
echo   build       Build for production
echo   docker      Deploy with Docker
echo   compose     Deploy with Docker Compose
echo   test        Test deployment
echo   cleanup     Clean up Docker resources
echo   help        Show this help message
echo.
echo Examples:
echo   deploy.bat dev      # Set up development environment
echo   deploy.bat docker   # Deploy with Docker
echo   deploy.bat compose  # Deploy with Docker Compose
echo   deploy.bat test     # Test deployment
goto :end

:dev
echo [INFO] Setting up development environment...
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo [INFO] Installing backend dependencies...
cd backend
call pip install -r requirements.txt
cd ..
echo [INFO] Development environment ready ✓
echo [INFO] Run 'npm run dev' in frontend/ to start frontend
echo [INFO] Run 'uvicorn main:app --reload' in backend/ to start backend
goto :end

:build
echo [INFO] Building for production...
echo [INFO] Building frontend...
cd frontend
call npm install
call npm run build
cd ..
echo [INFO] Installing backend dependencies...
cd backend
call pip install -r requirements.txt
cd ..
echo [INFO] Production build complete ✓
goto :end

:docker
echo [INFO] Deploying with Docker...
echo [INFO] Building Docker image...
docker build -t stock-consultant .
echo [INFO] Stopping existing container if running...
docker stop stock-consultant-app 2>nul
docker rm stock-consultant-app 2>nul
echo [INFO] Starting new container...
docker run -d --name stock-consultant-app -p 8000:8000 -e PYTHONPATH=/app stock-consultant
echo [INFO] Application deployed with Docker ✓
echo [INFO] Access your app at: http://localhost:8000
goto :end

:compose
echo [INFO] Deploying with Docker Compose...
echo [INFO] Starting services with Docker Compose...
docker-compose up -d
echo [INFO] Application deployed with Docker Compose ✓
echo [INFO] Access your app at: http://localhost:8000
echo [INFO] Access frontend at: http://localhost:3000
goto :end

:test
echo [INFO] Testing deployment...
echo [INFO] Testing backend health check...
curl -s http://localhost:8000/health
echo.
echo [INFO] Testing API endpoint...
curl -s -X POST http://localhost:8000/api/analyze -H "Content-Type: application/json" -d "{\"portfolio\":[{\"symbol\":\"AAPL\",\"shares\":10}]}"
echo.
echo [INFO] Test complete ✓
goto :end

:cleanup
echo [INFO] Cleaning up...
docker stop stock-consultant-app 2>nul
docker rm stock-consultant-app 2>nul
docker rmi stock-consultant 2>nul
docker-compose down 2>nul
echo [INFO] Cleanup complete ✓
goto :end

:end
