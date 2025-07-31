# Firebase Storage Setup Script - Simple Version
$gcloudPath = "C:\Users\ADMIN\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"
$gcloud = "$gcloudPath\gcloud.cmd"
$gsutil = "$gcloudPath\gsutil.cmd"

Write-Host "Firebase Storage Setup" -ForegroundColor Yellow

# Check if Firebase Storage bucket exists
Write-Host "Checking existing buckets..." -ForegroundColor Cyan
& $gsutil ls

# Create bucket if it doesn't exist
Write-Host "Creating Firebase Storage bucket..." -ForegroundColor Cyan
& $gsutil mb gs://deargift-f780b.appspot.com

# Set CORS policy
Write-Host "Setting CORS policy..." -ForegroundColor Cyan
& $gsutil cors set cors.json gs://deargift-f780b.appspot.com

# Verify CORS settings
Write-Host "Verifying CORS settings..." -ForegroundColor Green
& $gsutil cors get gs://deargift-f780b.appspot.com

Write-Host "Firebase Storage setup complete!" -ForegroundColor Green
Write-Host "Try uploading music again!" -ForegroundColor Yellow
