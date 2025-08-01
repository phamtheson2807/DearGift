# Hướng dẫn Chia sẻ Link DearGift

## Tại sao Link của tôi không hoạt động khi chia sẻ?

Có một số nguyên nhân phổ biến khiến link DearGift không hoạt động khi chia sẻ:

### 1. Link chứa localhost hoặc 127.0.0.1
**Vấn đề:** Link có dạng `http://localhost:3000/...` hoặc `http://127.0.0.1:...`
**Nguyên nhân:** Đây là địa chỉ máy local chỉ hoạt động trên máy tính của bạn
**Giải pháp:** 
- Sử dụng link có domain production: `https://deargift.netlify.app/...`
- Thay vì localhost, dùng tên miền thực tế

### 2. File nhạc sử dụng Blob URL
**Vấn đề:** Nhạc không phát khi người khác mở link
**Nguyên nhân:** File nhạc được upload dưới dạng Blob URL (blob:...) chỉ hoạt động trên máy upload
**Giải pháp:**
- Sử dụng nhạc có sẵn từ thư viện
- Nhập link nhạc từ source online (YouTube, SoundCloud, etc.)
- Upload qua server backend

### 3. Giao thức không an toàn (HTTP thay vì HTTPS)
**Vấn đề:** Một số tính năng không hoạt động trên HTTP
**Nguyên nhân:** Trình duyệt hiện đại yêu cầu HTTPS cho các tính năng âm thanh
**Giải pháp:** Đảm bảo link sử dụng `https://` thay vì `http://`

## Cách Kiểm tra Link hoạt động

1. **Kiểm tra định dạng URL:**
   - ✅ Tốt: `https://deargift.netlify.app/index.html?id=abc123`
   - ❌ Không tốt: `http://localhost:3000/index.html?id=abc123`
   - ❌ Không tốt: `file:///C:/Users/.../index.html?id=abc123`

2. **Test bằng trình duyệt ẩn danh:**
   - Mở link trong cửa sổ ẩn danh
   - Nếu hoạt động ở đây, có thể chia sẻ được

3. **Kiểm tra trên thiết bị khác:**
   - Thử mở link trên điện thoại hoặc máy tính khác
   - Đảm bảo không đăng nhập vào cùng tài khoản

## Best Practices cho Chia sẻ

### Đối với Nhạc:
1. **Ưu tiên sử dụng nhạc có sẵn** từ thư viện DearGift
2. **Nhập URL nhạc từ nguồn online** thay vì upload file
3. **Kiểm tra nhạc phát được** trước khi tạo galaxy

### Đối với Link:
1. **Luôn dùng domain production** thay vì localhost
2. **Sử dụng HTTPS** thay vì HTTP
3. **Test link trước khi chia sẻ** bằng cách mở ở tab mới

### Đối với Hình ảnh:
1. **Sử dụng hình ảnh nhỏ** để tải nhanh hơn
2. **Tránh upload hình quá lớn** (>5MB)

## Khắc phục Sự cố

### Nếu nhạc không phát:
```javascript
// Kiểm tra URL nhạc trong Console:
console.log("Music URL:", galaxyData.song);

// Nếu bắt đầu bằng "blob:", cần thay thế
// Ví dụ: thay "blob:..." bằng URL online
```

### Nếu link không mở được:
1. Kiểm tra link có đúng ID không
2. Kiểm tra server có online không
3. Thử mở link trong tab ẩn danh

### Nếu galaxy hiển thị trống:
1. Kiểm tra dữ liệu trong localStorage
2. Kiểm tra ID galaxy có đúng không
3. Kiểm tra console có lỗi JavaScript không

## Liên hệ Hỗ trợ

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Link galaxy không hoạt động
2. Thông báo lỗi từ console
3. Thiết bị và trình duyệt đang dùng
4. Các bước bạn đã thực hiện

---

*Cập nhật lần cuối: ${new Date().toLocaleDateString('vi-VN')}*
