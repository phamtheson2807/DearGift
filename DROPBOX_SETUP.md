# Hướng dẫn thiết lập Dropbox Upload cho DearGift

## Cách thiết lập Dropbox App

### Bước 1: Tạo Dropbox App
1. Truy cập [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Nhấn "Create app"
3. Chọn "Scoped access"
4. Chọn "Full Dropbox" 
5. Nhập tên app (ví dụ: "DearGift Music")
6. Nhấn "Create app"

### Bước 2: Cấu hình App
1. Trong tab **Settings**:
   - ✅ App key: `6lmeeq8njmvmdnf` (đã cập nhật)
   - Thêm domain của bạn vào **Redirect URIs**:
     - Localhost: `http://localhost:5500/creator.html`
     - Production: `https://yourdomain.com/creator.html`

2. Trong tab **Permissions**:
   - Tick ✅ `files.content.write` 
   - Tick ✅ `files.content.read`
   - Tick ✅ `sharing.write`
   - Nhấn "Submit"

### Bước 3: Cập nhật mã nguồn
✅ **ĐÃ CẬP NHẬT** - App Key đã được thiết lập:

```javascript
this.CLIENT_ID = '6lmeeq8njmvmdnf'; // Dropbox App Key đã cập nhật
```

**Lưu ý bảo mật**: App Secret (`y3kuqdpmnq63u2j`) không được sử dụng trong client-side code để đảm bảo an toàn.

## 🎉 Trạng thái: SẴN SÀNG SỬ DỤNG

✅ **App Key**: Đã cấu hình (`6lmeeq8njmvmdnf`)  
✅ **Permissions**: Cần thiết lập trong Dropbox Console  
⚠️ **Redirect URIs**: Cần thêm domain vào Dropbox App  

## Cách hoạt động

1. **Lần đầu sử dụng**: Người dùng sẽ được yêu cầu đăng nhập Dropbox
2. **Upload**: File nhạc được upload vào thư mục `/DearGift/` trên Dropbox
3. **Chia sẻ**: Tự động tạo public link để phát nhạc
4. **Lưu trữ**: Access token được lưu trong localStorage

## Testing

Để test trên localhost:
1. Thêm `http://localhost:5500/creator.html` vào Redirect URIs
2. Mở `creator.html` bằng Live Server
3. Upload file nhạc để test

## Production

Trước khi deploy:
1. Cập nhật Redirect URIs với domain thật
2. Thay App Key thật vào mã nguồn
3. Test upload và phát nhạc

## Giới hạn

- File size tối đa: 50MB
- Định dạng hỗ trợ: MP3, WAV, OGG
- Cần internet để upload và phát nhạc
- Dropbox free: 2GB storage

## Troubleshooting

- **Authentication failed**: Kiểm tra App Key và Redirect URI
- **Upload failed**: Kiểm tra file size và định dạng
- **Play failed**: Kiểm tra link có public không

## Security Note

Dropbox App chỉ có quyền truy cập vào thư mục app (`/Apps/DearGift Music/`), không thể truy cập file cá nhân của user.
