#!/bin/bash

# UniLink Capawesome Deployment Script
# This script automates the deployment process to Capawesome Cloud

set -e  # Exit on error

echo "🚀 UniLink Capawesome Deployment Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if logged in to Capawesome
print_info "Checking Capawesome authentication..."
if ! npx capawesome whoami &> /dev/null; then
    print_warning "Not logged in to Capawesome"
    print_info "Running: npx capawesome login"
    npx capawesome login
    print_success "Logged in successfully"
else
    print_success "Already logged in to Capawesome"
fi

# Build the web app
print_info "Building web app..."
npm run build
print_success "Build completed"

# Create bundle
print_info "Creating new bundle..."
BUNDLE_OUTPUT=$(npx capawesome bundles:create --path dist --json)
BUNDLE_ID=$(echo $BUNDLE_OUTPUT | jq -r '.id')

if [ -z "$BUNDLE_ID" ] || [ "$BUNDLE_ID" = "null" ]; then
    print_error "Failed to create bundle"
    exit 1
fi

print_success "Bundle created: $BUNDLE_ID"

# Ask which channel to deploy to
echo ""
echo "Which channel do you want to deploy to?"
echo "1) production (live users)"
echo "2) staging (testing)"
echo "3) development (dev testing)"
read -p "Enter choice [1-3]: " channel_choice

case $channel_choice in
    1)
        CHANNEL="production"
        ;;
    2)
        CHANNEL="staging"
        ;;
    3)
        CHANNEL="development"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Assign bundle to channel
print_info "Assigning bundle to $CHANNEL channel..."
npx capawesome bundles:channels:assign $CHANNEL --bundle-id $BUNDLE_ID

print_success "Bundle assigned to $CHANNEL"

# Show summary
echo ""
echo "========================================"
print_success "Deployment Complete!"
echo "========================================"
echo ""
echo "Bundle ID: $BUNDLE_ID"
echo "Channel: $CHANNEL"
echo ""
print_info "Users on the $CHANNEL channel will receive this update when they next open the app."
echo ""

# Ask if user wants to view stats
read -p "View deployment stats? (y/n): " view_stats

if [ "$view_stats" = "y" ] || [ "$view_stats" = "Y" ]; then
    echo ""
    npx capawesome apps:stats
fi

echo ""
print_success "All done! 🎉"
