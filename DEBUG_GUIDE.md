# 🔧 HƯỚNG DẪN DEBUG NHANH CHO VẤN ĐỀ DEARGIFT

## ❌ Vấn đề: "Sao lại ra trang này" 

Khi truy cập URL galaxy (`index.html?id=...`) nhưng hiển thị trang chủ thay vì galaxy viewer.

---

## 🚀 GIẢI PHÁP NHANH (3 bước)

### Bước 1: Kiểm tra ngay lập tức
1. Mở file: `quick-galaxy-test.html`
2. Click "Test All Links" 
3. Xem kết quả có lỗi gì không

### Bước 2: Debug chi tiết
1. Mở file: `debug-tool.html`
2. Chạy all tests
3. Kiểm tra redirect patterns

### Bước 3: Upload và test
1. Upload TẤT CẢ files đã sửa lên Netlify
2. Đợi 2-3 phút để cache clear
3. Test lại URL: `https://deargift.netlify.app/index.html?id=mdsbnjpj2y6k9z`

---

## 📁 Files đã sửa/tạo mới:

### 🔧 Files sửa lỗi:
- `_redirects` - Sửa redirect rules
- `netlify.toml` - Thêm explicit redirects cho index.html  
- `creator.js` - Đã có sẵn (tạo link đúng)

### 🛠️ Tools debug mới:
- `quick-galaxy-test.html` - Test nhanh các links
- `debug-tool.html` - Tool debug chi tiết  
- `test-galaxy-links.html` - Tool test sharing (đã có)

### 📋 Files backup:
- `index-galaxy-viewer-backup.html` - Backup của index.html

---

## 🎯 Checklist sau khi upload:

- [ ] Upload tất cả files lên Netlify
- [ ] Đợi cache clear (2-3 phút)  
- [ ] Test URL: `https://deargift.netlify.app/index.html?demo=1`
- [ ] Test URL: `https://deargift.netlify.app/index.html?id=test123`
- [ ] Test URL thực: `https://deargift.netlify.app/index.html?id=mdsbnjpj2y6k9z`

---

## 🔍 Nếu vẫn lỗi:

### Kiểm tra cache:
```bash
# Trong Chrome DevTools (F12) > Network tab:
1. Tick "Disable cache"
2. Hard refresh (Ctrl+Shift+R)
3. Kiểm tra response của index.html
```

### Debug steps:
1. Mở `debug-tool.html` 
2. Click "Clear Cache & Test"
3. Xem kết quả trong "URL Test Results"
4. Nếu vẫn lỗi, chụp ảnh kết quả để debug

---

## 📞 Liên hệ hỗ trợ:

Nếu vẫn lỗi, cung cấp:
1. Screenshots của `debug-tool.html` results
2. URL đang test
3. Browser + device đang dùng
4. Thông báo lỗi trong Console (F12)

---

## 🎉 Expected Result:

Sau khi sửa, URL `https://deargift.netlify.app/index.html?id=...` sẽ hiển thị:
- Galaxy viewer với loading screen
- Không phải trang chủ với menu
- Demo banner nếu là `?demo=1`
- Galaxy animation với nhạc

---

*Debug guide - Updated: ${new Date().toLocaleDateString('vi-VN')}*
