# Firebase Storage CORS Fix Script
Write-Host "🔥 Firebase Storage CORS Fix" -ForegroundColor Yellow

# Check if gcloud is installed
try {
    $gcloud = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ Google Cloud SDK found" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK not found. Installing..." -ForegroundColor Red
    Write-Host "📥 Downloading Google Cloud SDK..." -ForegroundColor Cyan
    
    # Download and install Google Cloud SDK
    (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
    & $env:Temp\GoogleCloudSDKInstaller.exe
    
    Write-Host "⏳ Please restart PowerShell after installation and run this script again." -ForegroundColor Yellow
    exit 0
}

# Check if user is logged in
Write-Host "🔑 Checking authentication..." -ForegroundColor Cyan
try {
    $authCheck = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if ([string]::IsNullOrEmpty($authCheck)) {
        Write-Host "🔐 Logging in to Google Cloud..." -ForegroundColor Cyan
        gcloud auth login
    } else {
        Write-Host "✅ Already logged in as: $authCheck" -ForegroundColor Green
    }
} catch {
    Write-Host "🔐 Logging in to Google Cloud..." -ForegroundColor Cyan
    gcloud auth login
}

# Set project
Write-Host "🎯 Setting project to deargift-f780b..." -ForegroundColor Cyan
gcloud config set project deargift-f780b

# Set CORS for Firebase Storage bucket
Write-Host "🔧 Setting CORS for Firebase Storage..." -ForegroundColor Cyan

try {
    gsutil cors set cors.json gs://deargift-f780b.appspot.com
    Write-Host "✅ CORS configuration applied successfully!" -ForegroundColor Green
    
    # Verify CORS settings
    Write-Host "🔍 Verifying CORS settings..." -ForegroundColor Cyan
    gsutil cors get gs://deargift-f780b.appspot.com
    
} catch {
    Write-Host "❌ Failed to set CORS. Possible issues:" -ForegroundColor Red
    Write-Host "- Make sure you're logged in with the correct account" -ForegroundColor Yellow
    Write-Host "- The account must have Firebase Storage admin permissions" -ForegroundColor Yellow
    Write-Host "- Check if the project ID is correct" -ForegroundColor Yellow
}

Write-Host "`n🎵 Try uploading music again on your website!" -ForegroundColor Yellow
Write-Host "🌐 URL: https://deargiftt.netlify.app/creator.html" -ForegroundColor Cyan
