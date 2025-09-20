#!/bin/bash

# Stock Consultant Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🚀 Stock Consultant Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_status "Docker is installed ✓"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    print_status "Node.js is installed ✓"
}

# Check if Python is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    print_status "Python 3 is installed ✓"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    print_status "Frontend built successfully ✓"
}

# Build backend
build_backend() {
    print_status "Installing Python dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
    print_status "Backend dependencies installed ✓"
}

# Docker deployment
deploy_docker() {
    print_status "Deploying with Docker..."
    check_docker
    
    # Build the image
    docker build -t stock-consultant .
    
    # Run the container
    docker run -d \
        --name stock-consultant-app \
        -p 8000:8000 \
        -e PYTHONPATH=/app \
        stock-consultant
    
    print_status "Application deployed with Docker ✓"
    print_status "Access your app at: http://localhost:8000"
}

# Docker Compose deployment
deploy_compose() {
    print_status "Deploying with Docker Compose..."
    check_docker
    
    # Start services
    docker-compose up -d
    
    print_status "Application deployed with Docker Compose ✓"
    print_status "Access your app at: http://localhost:8000"
    print_status "Access frontend at: http://localhost:3000"
}

# Local development setup
setup_dev() {
    print_status "Setting up development environment..."
    
    check_node
    check_python
    
    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    
    # Install backend dependencies
    cd backend
    pip install -r requirements.txt
    cd ..
    
    print_status "Development environment ready ✓"
    print_status "Run 'npm run dev' in frontend/ to start frontend"
    print_status "Run 'uvicorn main:app --reload' in backend/ to start backend"
}

# Production build
build_production() {
    print_status "Building for production..."
    
    check_node
    check_python
    
    # Build frontend
    build_frontend
    
    # Install backend dependencies
    build_backend
    
    print_status "Production build complete ✓"
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Stop and remove Docker containers
    docker stop stock-consultant-app 2>/dev/null || true
    docker rm stock-consultant-app 2>/dev/null || true
    
    # Remove Docker images
    docker rmi stock-consultant 2>/dev/null || true
    
    # Clean up Docker Compose
    docker-compose down 2>/dev/null || true
    
    print_status "Cleanup complete ✓"
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Set up development environment"
    echo "  build       Build for production"
    echo "  docker      Deploy with Docker"
    echo "  compose     Deploy with Docker Compose"
    echo "  cleanup     Clean up Docker resources"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Set up development environment"
    echo "  $0 docker   # Deploy with Docker"
    echo "  $0 compose  # Deploy with Docker Compose"
}

# Main script logic
case "${1:-help}" in
    "dev")
        setup_dev
        ;;
    "build")
        build_production
        ;;
    "docker")
        deploy_docker
        ;;
    "compose")
        deploy_compose
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac
