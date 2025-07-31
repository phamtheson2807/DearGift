# Deploy Firestore Rules Script
$firebasePath = "C:\Users\ADMIN\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"
$firebase = "$firebasePath\firebase.cmd"

Write-Host "Deploying Firestore Rules" -ForegroundColor Yellow

# Check if we're in the right directory
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Check if firebase.json exists
if (Test-Path "firebase.json") {
    Write-Host "firebase.json found" -ForegroundColor Green
} else {
    Write-Host "firebase.json not found" -ForegroundColor Red
    exit 1
}

# Check if firestore.rules exists
if (Test-Path "firestore.rules") {
    Write-Host "firestore.rules found" -ForegroundColor Green
} else {
    Write-Host "firestore.rules not found" -ForegroundColor Red
    exit 1
}

# Deploy Firestore rules only
Write-Host "Deploying Firestore rules..." -ForegroundColor Cyan
& $firebase deploy --only firestore:rules --project deargift-f780b

Write-Host "Deployment completed" -ForegroundColor Green
