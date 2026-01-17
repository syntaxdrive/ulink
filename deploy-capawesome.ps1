# UniLink Capawesome Deployment Script (PowerShell)
# This script automates the deployment process to Capawesome Cloud

$ErrorActionPreference = "Stop"

Write-Host "🚀 UniLink Capawesome Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Print-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Print-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check if logged in to Capawesome
Print-Info "Checking Capawesome authentication..."
try {
    $null = npx capawesome whoami 2>&1
    Print-Success "Already logged in to Capawesome"
} catch {
    Print-Warning "Not logged in to Capawesome"
    Print-Info "Running: npx capawesome login"
    npx capawesome login
    Print-Success "Logged in successfully"
}

# Build the web app
Print-Info "Building web app..."
npm run build
Print-Success "Build completed"

# Create bundle
Print-Info "Creating new bundle..."
$bundleOutput = npx capawesome bundles:create --path dist --json | ConvertFrom-Json
$bundleId = $bundleOutput.id

if ([string]::IsNullOrEmpty($bundleId)) {
    Print-Error "Failed to create bundle"
    exit 1
}

Print-Success "Bundle created: $bundleId"

# Ask which channel to deploy to
Write-Host ""
Write-Host "Which channel do you want to deploy to?"
Write-Host "1) production (live users)"
Write-Host "2) staging (testing)"
Write-Host "3) development (dev testing)"
$channelChoice = Read-Host "Enter choice [1-3]"

switch ($channelChoice) {
    "1" { $channel = "production" }
    "2" { $channel = "staging" }
    "3" { $channel = "development" }
    default {
        Print-Error "Invalid choice"
        exit 1
    }
}

# Assign bundle to channel
Print-Info "Assigning bundle to $channel channel..."
npx capawesome bundles:channels:assign $channel --bundle-id $bundleId

Print-Success "Bundle assigned to $channel"

# Show summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Print-Success "Deployment Complete!"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bundle ID: $bundleId"
Write-Host "Channel: $channel"
Write-Host ""
Print-Info "Users on the $channel channel will receive this update when they next open the app."
Write-Host ""

# Ask if user wants to view stats
$viewStats = Read-Host "View deployment stats? (y/n)"

if ($viewStats -eq "y" -or $viewStats -eq "Y") {
    Write-Host ""
    npx capawesome apps:stats
}

Write-Host ""
Print-Success "All done! 🎉"
