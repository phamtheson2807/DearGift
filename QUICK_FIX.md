# 🔧 HƯỚNG DẪN NHANH SỬA LỖI DEARGIFT

## ❌ Vấn đề: "Sao lại ra trang này" / Hiển thị sai trang

### Triệu chứng:
- Truy cập `index.html?id=...` nhưng hiển thị trang chủ với menu
- Galaxy viewer không hiển thị mà thay vào đó là trang bán hàng
- URL đúng nhưng nội dung sai

### Nguyên nhân:
**File `_redirects` cấu hình sai** - đang redirect tất cả về `home.html`

### ✅ Giải pháp:

#### Bước 1: Sửa file `_redirects`
Mở file `_redirects` và thay thế nội dung bằng:
```
# Netlify redirects file

# Redirect root to home page
/  /home.html  200

# Handle galaxy viewer routes - specific ID patterns
/index.html*  /index.html  200
/galaxy/*  /index.html  200

# Handle share routes
/share/*  /share.html  200

# Creator page
/creator.html*  /creator.html  200
/create.html*  /creator.html  200

# Dashboard
/dashboard.html*  /dashboard.html  200

# Other static files should be served as-is
/*.html  /:splat  200
/*.js  /:splat  200
/*.css  /:splat  200
/*.json  /:splat  200
/*.md  /:splat  200

# SPA fallback only for unmatched routes
/*  /home.html  200
```

#### Bước 2: Test ngay lập tức
1. Mở file `test-galaxy-links.html` để kiểm tra
2. Test các link quan trọng:
   - `index.html?demo=1` (Demo mode)
   - `index.html?id=test123` (Galaxy viewer)
   - `home.html` (Trang chủ)

#### Bước 3: Deploy lại
1. Upload files lên Netlify
2. Đợi vài phút để cache clear
3. Test lại URL galaxy

---

## ❌ Vấn đề: "Truy cập link báo koong tìm thấy website"

### Nguyên nhân chính:
1. **Link chứa localhost** (http://localhost:3000/...)
2. **Link chứa blob URL** (blob:...)
3. **Link không đúng định dạng**

### ✅ Giải pháp nhanh:

#### Bước 1: Kiểm tra link của bạn
- **Link ĐÚNG**: `https://deargift.netlify.app/index.html?id=abc123`
- **Link SAI**: `http://localhost:3000/index.html?id=abc123`

#### Bước 2: Nếu link sai, làm theo:
1. Mở file `creator.js`
2. Tìm dòng có `productionBaseUrl`
3. Đảm bảo nó là: `https://deargift.netlify.app/`

#### Bước 3: Upload lại project
1. Upload toàn bộ folder lên Netlify
2. Đảm bảo domain là `https://deargift.netlify.app`

---

## 🎵 Vấn đề: Nhạc không phát được khi chia sẻ

### Nguyên nhân:
- File nhạc dùng **Blob URL** (chỉ hoạt động trên máy upload)
- URL nhạc chứa **localhost**

### ✅ Giải pháp:

#### Cách 1: Dùng nhạc có sẵn
1. Trong Creator, chọn tab "Nhạc có sẵn"
2. Chọn bài hát từ thư viện
3. **KHÔNG upload file**

#### Cách 2: Nhập URL nhạc online
1. Tìm link nhạc online (YouTube, SoundCloud, etc.)
2. Chọn tab "Nhập link"
3. Dán URL nhạc vào

---

## 🛠️ Tools hỗ trợ

### 1. Galaxy Links Test Tool ⭐ MỊI
- Mở file: `test-galaxy-links.html`
- Kiểm tra tất cả links trong 1 nơi
- Auto-test và báo cáo lỗi

### 2. Test Sharing Tool
- Mở file: `test-sharing.html`
- Test URL và nhạc trước khi chia sẻ

### 3. Quick Fix Batch
- Chạy file: `quick-fix-sharing.bat`
- Tool tự động kiểm tra và sửa lỗi

---

## 📋 Checklist trước khi chia sẻ

- [ ] Link bắt đầu bằng `https://deargift.netlify.app`
- [ ] Không chứa `localhost` hoặc `127.0.0.1`
- [ ] Có tham số `?id=...` hoặc `?demo=1`
- [ ] Nhạc KHÔNG phải file upload (dùng nhạc có sẵn)
- [ ] Test link trong `test-galaxy-links.html`
- [ ] File `_redirects` cấu hình đúng

---

## 🆘 Nếu vẫn lỗi

### Kiểm tra Console:
1. Mở Chrome DevTools (F12)
2. Vào tab Console
3. Tìm lỗi màu đỏ
4. Báo cáo lỗi cùng với:
   - Link galaxy
   - Thông báo lỗi
   - Thiết bị/trình duyệt

### Links hữu ích:
- **Website chính**: https://deargift.netlify.app
- **Creator page**: https://deargift.netlify.app/creator.html
- **Test tool**: Mở file `test-galaxy-links.html` ⭐
- **Debug tool**: Mở file `test-sharing.html`

---

## 🎯 Lời khuyên

1. **Luôn dùng nhạc có sẵn** thay vì upload
2. **Test link với tool mới** `test-galaxy-links.html`
3. **Kiểm tra file `_redirects`** trước khi deploy
4. **Sử dụng HTTPS** thay vì HTTP
5. **Kiểm tra trên thiết bị khác** để đảm bảo

---

*Cập nhật: ${new Date().toLocaleDateString('vi-VN')} - Phiên bản fix redirect + sharing*
