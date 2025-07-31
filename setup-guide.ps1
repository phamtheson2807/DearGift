# Firebase Storage CORS Setup - Step by Step Guide
Write-Host "🔥 Firebase Storage CORS Setup Guide" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan

Write-Host "`n1️⃣ Login to Google Cloud:" -ForegroundColor Green
Write-Host "gcloud auth login" -ForegroundColor White

Write-Host "`n2️⃣ Set your project:" -ForegroundColor Green  
Write-Host "gcloud config set project deargift-f780b" -ForegroundColor White

Write-Host "`n3️⃣ Apply CORS configuration:" -ForegroundColor Green
Write-Host "gsutil cors set cors.json gs://deargift-f780b.appspot.com" -ForegroundColor White

Write-Host "`n4️⃣ Verify CORS settings:" -ForegroundColor Green
Write-Host "gsutil cors get gs://deargift-f780b.appspot.com" -ForegroundColor White

Write-Host "`n🎵 After completing these steps, music uploads should work!" -ForegroundColor Yellow

Write-Host "`n🔗 If you need help:" -ForegroundColor Cyan
Write-Host "- Make sure you're logged in with the correct Google account" -ForegroundColor Gray
Write-Host "- The account must have Firebase Storage admin permissions" -ForegroundColor Gray
