# 🔥 Firebase Storage CORS Error - Hướng Dẫn Fix

## ❌ Lỗi hiện tại:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://127.0.0.1:5500' has been blocked by CORS policy
```

## 🛠️ Cách Fix:

### 1. **Kiểm tra Firebase Storage Rules**
Vào Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Tạm thời cho phép tất cả
    }
  }
}
```

### 2. **Enable Firebase Storage**
1. Vào Firebase Console
2. Project Settings → General
3. Kiểm tra "Default GCP resource location" đã được set chưa
4. Nếu chưa: chọn region gần nhất (asia-southeast1)

### 3. **Kiểm tra Authentication Domains**
Firebase Console → Authentication → Settings → Authorized domains:
- Thêm: `localhost`
- Thêm: `127.0.0.1`

### 4. **Initialize Storage với CORS Config**
Thử config CORS cho Storage bucket:

```bash
# Install Google Cloud SDK
# Sau đó chạy:
gsutil cors set cors.json gs://deargift-f780b.appspot.com
```

File `cors.json`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

### 5. **Fallback Solution: Blob Upload**
Nếu Firebase Storage không hoạt động, sử dụng Blob URL:

```javascript
// Tạm thời store file as blob URL
const blobUrl = URL.createObjectURL(file);
// Lưu blob URL vào galaxy data
```

## 🚀 Quick Fix cho Development:

### Option 1: Sử dụng Netlify Deploy
1. Deploy code lên Netlify
2. Test upload từ domain production
3. Firebase sẽ chấp nhận domain chính thức

### Option 2: Local Development với Blob
1. Sử dụng blob URL cho local testing
2. Upload Firebase khi deploy production

### Option 3: Firebase Emulator
```bash
npm install -g firebase-tools
firebase login
firebase init storage
firebase emulators:start --only storage
```

## 🔧 Debug Steps:

1. **Check Firebase Console:**
   - Storage bucket tồn tại?
   - Rules cho phép upload?
   - Usage quotas OK?

2. **Check Network Tab:**
   - Request có được gửi đi?
   - Response status code?
   - Headers có CORS?

3. **Check Firebase Config:**
   - storageBucket đúng URL?
   - Project ID match?
   - API keys valid?

## 📱 Test Command:
```javascript
// Run in browser console
fetch('https://firebasestorage.googleapis.com/v0/b/deargift-f780b.appspot.com/o')
  .then(r => console.log('Storage accessible:', r.status))
  .catch(e => console.log('Storage error:', e));
```
