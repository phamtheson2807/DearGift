# Hướng Dẫn Cấu Hình Firebase cho DearGift

## 1. Tạo Project Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Thêm dự án"
3. Đặt tên project (ví dụ: `deargift-music`)
4. Tích chọn Google Analytics (tùy chọn)
5. Click "Create project"

## 2. Thiết Lập Web App

1. Trong Firebase Console, click icon web `</>`
2. Đặt tên app (ví dụ: `DearGift Web`)
3. Tích chọn "Also set up Firebase Hosting" (tùy chọn)
4. Click "Register app"

## 3. Lấy Firebase Configuration

Sau khi tạo app, bạn sẽ thấy code config như sau:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "deargift-music.firebaseapp.com",
  projectId: "deargift-music",
  storageBucket: "deargift-music.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**Sao chép config này và thay thế vào file `firebase-config.js`**

## 4. Thiết Lập Firestore Database

1. Trong Firebase Console, vào "Firestore Database"
2. Click "Create database"
3. Chọn "Start in test mode" (để bắt đầu)
4. Chọn location gần Việt Nam (ví dụ: asia-southeast1)

### Firestore Rules (Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write on galaxies collection
    match /galaxies/{document} {
      allow read, write: if true; // Tạm thời cho phép mọi người
    }
  }
}
```

## 5. Thiết Lập Firebase Storage

1. Trong Firebase Console, vào "Storage"
2. Click "Get started"
3. Chọn "Start in test mode"
4. Chọn location giống Firestore

### Storage Rules (Production)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow upload/download music files
    match /music/{allPaths=**} {
      allow read, write: if request.resource.size < 50 * 1024 * 1024; // 50MB max
    }
  }
}
```

## 6. Cập Nhật firebase-config.js

Mở file `firebase-config.js` và thay thế config:

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## 7. Test Firebase Connection

1. Mở Developer Tools (F12)
2. Vào `creator.html`
3. Kiểm tra Console log:
   - "Firebase initialized successfully" ✅
   - "Firebase Storage initialized for music uploads" ✅

## 8. Upload Music Test

1. Vào trang Creator
2. Chọn "Tải nhạc lên"
3. Upload file nhạc
4. Kiểm tra:
   - Progress upload hiển thị
   - "Đã tải lên Firebase" message
   - File xuất hiện trong Firebase Storage Console

## 9. Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, thêm domain vào Firebase:
1. Firebase Console > Authentication > Settings
2. Authorized domains: thêm `localhost`, `127.0.0.1`, domain production

### Lỗi Permission
Nếu không upload được:
1. Kiểm tra Storage Rules
2. Đảm bảo test mode được bật
3. Kiểm tra file size < 50MB

### Debug Console
```javascript
// Test Firebase connection
console.log('Firebase:', firebase);
console.log('Storage:', firebase.storage());
console.log('Firestore:', firebase.firestore());
```

## 10. Production Deployment

Khi deploy production:
1. Cập nhật domain trong Firebase
2. Thay đổi Rules sang production mode
3. Thiết lập Authentication nếu cần

---

**Lưu ý:** Backup config Firebase và không share public API keys!
