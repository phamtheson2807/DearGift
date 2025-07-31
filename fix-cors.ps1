# Firebase Storage CORS Fix Script
Write-Host "🔥 Firebase Storage CORS Fix" -ForegroundColor Yellow

# Check if gcloud is installed
try {
    $gcloud = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ Google Cloud SDK found" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK not found. Please install it first:" -ForegroundColor Red
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    exit 1
}

# Set CORS for Firebase Storage bucket
Write-Host "🔧 Setting CORS for Firebase Storage..." -ForegroundColor Cyan

try {
    gsutil cors set cors.json gs://deargift-f780b.appspot.com
    Write-Host "✅ CORS configuration applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set CORS. Make sure you're logged in:" -ForegroundColor Red
    Write-Host "Run: gcloud auth login" -ForegroundColor Cyan
}

Write-Host "🎵 Try uploading music again!" -ForegroundColor Yellow
