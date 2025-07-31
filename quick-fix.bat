@echo off
echo 🔥 Quick Firebase CORS Fix
echo ===========================

echo 1️⃣ Login to Google Cloud...
gcloud auth login

echo 2️⃣ Set project...
gcloud config set project deargift-f780b

echo 3️⃣ Apply CORS configuration...
gsutil cors set cors.json gs://deargift-f780b.appspot.com

echo 4️⃣ Verify CORS settings...
gsutil cors get gs://deargift-f780b.appspot.com

echo ✅ Done! Try uploading music again!
pause
