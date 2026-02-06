#!/bin/bash

# ART IS SAFE - Deployment Script for Simply.com
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting deployment for ART IS SAFE..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="artissafe"
APP_DIR="$HOME/artissafe"
NODE_VERSION="18"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project directory?"
    exit 1
fi

print_success "Found package.json"

# Check Node.js version
echo "Checking Node.js version..."
NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION or higher is required. Current: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://dboyqhwlbbjdfhdgdpkc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=https://www.artissafe.dk
EOF
    print_warning "Please update .env.local with your actual values before continuing!"
    exit 1
fi
print_success "Environment variables found"

# Install dependencies
echo "Installing dependencies..."
npm ci --production
print_success "Dependencies installed"

# Build the application
echo "Building Next.js application..."
npm run build
print_success "Build completed"

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    mkdir -p logs
    print_success "Created logs directory"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed"
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "$APP_NAME"; then
    echo "Stopping existing PM2 process..."
    pm2 stop $APP_NAME
    print_success "Stopped existing process"
fi

# Start or restart the application with PM2
echo "Starting application with PM2..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart $APP_NAME
    print_success "Application restarted"
else
    pm2 start ecosystem.config.js
    print_success "Application started"
fi

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

# Display application status
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
print_success "Deployment completed successfully!"
echo ""
echo "🌐 Your application should now be running at:"
echo "   https://www.artissafe.dk"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs $APP_NAME     - View application logs"
echo "   pm2 restart $APP_NAME  - Restart application"
echo "   pm2 stop $APP_NAME     - Stop application"
echo "   pm2 monit              - Monitor application"
echo ""
