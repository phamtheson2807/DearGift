# 🎵 DearGift Music System - Hướng dẫn sử dụng

## 📋 **Tổng quan**

DearGift hiện đã có hệ thống nhạc hoàn chỉnh với:
- ✅ **File nhạc thực** từ YouTube (đã tải)
- ✅ **Upload nhạc từ người dùng**
- ✅ **Preview và test nhạc**
- ✅ **Tương thích Safari và Chrome**

## 🎧 **Nhạc có sẵn (Preset Songs)**

### 💕 **Love Songs:**
1. **Anh Là Của Em - Karik ft. Lou Hoàng (Cover)** - `./songs/anh_la_cua_em.mp4`
2. **Yêu Là Tha Thu - Onlyc ft. Karik (Cover)** - `./songs/yeu_la_tha_thu.mp4`
3. **Có Chàng Trai Viết Lên Cây (Piano Cover)** - `./songs/co_chang_trai_viet_len_cay.mp4`

### 🎂 **Birthday Songs:**
1. **Chúc Mừng Sinh Nhật (Instrumental)** - `./songs/chuc_mung_sinh_nhat.mp4`

### 🎼 **Instrumental:**
1. **Piano Acoustic Cover** - `./songs/co_chang_trai_viet_len_cay.mp4`

### 🔥 **Trending:**
1. **Anh Là Của Em (Popular Cover)** - `./songs/anh_la_cua_em.mp4`
2. **Yêu Là Tha Thu (Trending)** - `./songs/yeu_la_tha_thu.mp4`

## 📤 **Upload nhạc từ người dùng**

### **Định dạng được hỗ trợ:**
- ✅ MP3 (Recommended)
- ✅ MP4 (Video with audio)
- ✅ WAV (High quality)
- ✅ WebM (Web optimized)
- ✅ M4A (iTunes format)
- ✅ OGG (Open source)

### **Giới hạn:**
- 📦 **Kích thước tối đa**: 10MB
- 📁 **Lưu trữ**: `./songs/uploads/`
- 🔄 **Tự động đổi tên**: `user_song_[timestamp].[ext]`

### **Cách sử dụng:**
1. Vào **Creator** → **Chọn nhạc** → **Upload**
2. Click chọn file hoặc kéo thả
3. File được validate và lưu tự động
4. Sử dụng ngay trong galaxy

## 🔧 **Cách kiểm tra hệ thống**

### **1. Test Audio Files:**
```bash
# Mở file test
open test-music-system.html
# Hoặc
open test-audio.html
```

### **2. Test Creator:**
```bash
# Mở creator
open creator.html
# Test tạo galaxy với nhạc
```

### **3. Test Galaxy Viewer:**
```bash
# Tạo galaxy với nhạc, sau đó xem
open index.html?id=YOUR_GALAXY_ID
```

## 🎮 **Cách sử dụng trong Creator**

### **Bước 1: Chọn nhạc**
1. Scroll xuống phần **"🎵 Chọn nhạc nền"**
2. Chọn tab **Preset** (nhạc có sẵn) hoặc **Upload** (tự tải lên)

### **Bước 2: Preset Songs**
1. Chọn category: Love, Birthday, Trending, Instrumental
2. Click vào bài nhạc muốn dùng
3. Preview bằng nút ▶️

### **Bước 3: Upload Songs**
1. Click **"Chọn File"** hoặc kéo thả file
2. Chờ upload hoàn thành (hiện thông báo ✅)
3. File được lưu tự động

### **Bước 4: Tạo Galaxy**
1. Điền thông tin galaxy (messages, icons, images...)
2. Click **"Tạo Galaxy"**
3. Nhạc được include tự động

## 🌐 **Cách nhạc hoạt động trong Galaxy**

### **Khi xem Galaxy:**
1. Nhạc tự động load nhưng **bị muted** (Safari policy)
2. Hiện audio controls ở góc phải dưới
3. User click ▶️ để unmute và phát nhạc
4. Có volume slider để điều chỉnh

### **Audio Controls:**
- ▶️/⏸️ **Play/Pause**
- 🔊 **Volume slider**
- ✖️ **Close controls**

## 🐛 **Troubleshooting**

### **Nhạc không phát được:**
1. ✅ Kiểm tra file path trong console
2. ✅ Test file bằng `test-music-system.html`
3. ✅ Đảm bảo file size < 10MB
4. ✅ Click Play button để unmute

### **Upload không hoạt động:**
1. ✅ Kiểm tra định dạng file (MP3, MP4, WAV, etc.)
2. ✅ Kiểm tra kích thước < 10MB
3. ✅ Thử refresh page và upload lại
4. ✅ Check console cho error messages

### **Safari không hoạt động:**
1. ✅ File `safari-compatibility.js` đã load
2. ✅ Audio được set muted=true initially
3. ✅ User interaction required để play

## 📂 **Cấu trúc file**

```
DearGift/
├── songs/                          # Thư mục nhạc
│   ├── anh_la_cua_em.mp4          # Nhạc đã tải
│   ├── yeu_la_tha_thu.mp4         # Nhạc đã tải
│   ├── co_chang_trai_viet_len_cay.mp4
│   ├── chuc_mung_sinh_nhat.mp4
│   ├── uploads/                    # Nhạc upload từ user
│   ├── playlist.json              # Database nhạc preset
│   └── README.md                  # Hướng dẫn tải nhạc
├── creator.html                    # Trang tạo galaxy
├── creator.js                     # Logic creator
├── music-upload.js                # Upload manager
├── galaxy-viewer.js               # Logic xem galaxy
├── test-music-system.html         # Test toàn bộ hệ thống
└── test-audio.html                # Test audio đơn giản
```

## 🚀 **Tối ưu và mở rộng**

### **Hiện tại:**
- ✅ File local trong project
- ✅ Blob URL cho upload
- ✅ Browser compatibility

### **Có thể mở rộng:**
- 🔄 Upload to cloud storage (Firebase Storage)
- 🔄 Streaming từ CDN
- 🔄 Audio compression
- 🔄 Playlist management
- 🔄 Social sharing nhạc

## 📞 **Liên hệ và support**

Nếu có vấn đề về hệ thống nhạc:
1. Kiểm tra `test-music-system.html` trước
2. Check browser console cho errors
3. Đảm bảo file structure đúng
4. Test với file nhạc đơn giản trước

---

🎉 **Hệ thống nhạc DearGift đã sẵn sàng sử dụng!**
