# DearGift - Galaxy Creator System

🌌 **DearGift** là một hệ thống tạo và chia sẻ galaxy tin nhắn tuyệt đẹp với hiệu ứng 3D tương tác.

## 🎯 Tính năng chính

### ✨ Tạo Galaxy
- **Tin nhắn tùy chỉnh**: Viết nhiều tin nhắn, mỗi dòng một tin nhắn
- **Biểu tượng**: Thêm emoji và biểu tượng yêu thích
- **Màu sắc**: Tùy chỉnh màu tin nhắn với color picker
- **Ảnh**: Upload nhiều ảnh để hiển thị trong galaxy
- **Nhạc nền**: Thêm file audio (MP3, WAV, OGG)
- **Hiệu ứng trái tim**: Bật/tắt hiệu ứng trái tim khi double click
- **Tên trái tim**: Tùy chỉnh text hiển thị trên trái tim

### 🌌 Galaxy Viewer
- **Hiệu ứng 3D**: Galaxy quay được, zoom in/out
- **Tương tác cảm ứng**: Hỗ trợ drag, pinch zoom trên mobile
- **Particle Animation**: Tin nhắn và ảnh rơi như mưa sao
- **Heart Effect**: Double click để xem hiệu ứng trái tim tuyệt đẹp
- **Responsive**: Tối ưu cho cả desktop và mobile

### 🔗 Chia sẻ
- **ID duy nhất**: Mỗi galaxy có ID riêng biệt
- **QR Code**: Tự động tạo QR code để chia sẻ
- **Link chia sẻ**: Trang share đẹp với preview nội dung
- **Social sharing**: Meta tags tối ưu cho Facebook, Twitter

### 📊 Quản lý
- **Dashboard**: Xem tất cả galaxy đã tạo
- **Thống kê**: Theo dõi lượt xem, số tin nhắn, ngày tạo
- **Preview**: Xem trước nội dung galaxy
- **Xóa**: Quản lý và xóa galaxy không cần thiết

## 📁 Cấu trúc dự án

```
deargift/
├── home.html              # Landing page chính
├── index.html             # Galaxy viewer (redirect từ home nếu có ID)
├── creator.html           # Trang tạo galaxy mới
├── share.html             # Trang chia sẻ galaxy
├── dashboard.html         # Quản lý galaxy đã tạo
├── galaxy-viewer.js       # Logic galaxy viewer
├── galaxy-viewer.css      # Styles cho galaxy viewer
├── creator.js             # Logic trang creator
├── detect-devtools.js     # Bảo vệ chống inspect
└── README.md             # Hướng dẫn này
```

## 🚀 Cách sử dụng

### 1. Tạo Galaxy mới
1. Truy cập `creator.html`
2. Điền thông tin:
   - **Tin nhắn**: Mỗi dòng một tin nhắn
   - **Biểu tượng**: Nhập emoji và nhấn Enter để thêm
   - **Màu sắc**: Chọn màu cho tin nhắn
   - **Ảnh**: Upload hoặc kéo thả ảnh
   - **Nhạc nền**: Chọn file audio (tùy chọn)
   - **Tên trái tim**: Text hiển thị trên hiệu ứng trái tim
3. Nhấn "🚀 Tạo Galaxy của tôi"
4. Nhận link chia sẻ và QR code

### 2. Xem Galaxy
- **Với ID**: `index.html?id=YOUR_ID`
- **Demo mode**: `index.html?demo=1`
- **Tương tác**:
  - Kéo chuột/ngón tay để xoay galaxy
  - Scroll/pinch để zoom
  - Double click để xem hiệu ứng trái tim

### 3. Chia sẻ Galaxy
- Sử dụng link: `share.html?id=YOUR_ID`
- Trang chia sẻ hiển thị:
  - Preview nội dung galaxy
  - QR code
  - Nút xem và copy link

### 4. Quản lý Galaxy
- Truy cập `dashboard.html`
- Xem thống kê tổng quan
- Quản lý tất cả galaxy đã tạo
- Preview, chia sẻ hoặc xóa galaxy

## 🛠️ Setup và Development

### Yêu cầu
- Web server (có thể dùng Live Server của VS Code)
- Browser hỗ trợ ES6+ và WebGL

### Chạy local
1. Clone dự án
2. Mở bằng VS Code
3. Cài đặt Live Server extension
4. Click "Go Live" hoặc mở `home.html`

### Customization
- **Màu sắc**: Sửa trong CSS variables
- **Dữ liệu demo**: Sửa `demoGalaxyDataDefault` trong `galaxy-viewer.js`
- **Particle count**: Điều chỉnh `maxParticles` trong `galaxy-viewer.js`

## 💾 Lưu trữ dữ liệu

Hiện tại dự án sử dụng **localStorage** để lưu trữ:
- `deargift_galaxies`: Dữ liệu chi tiết các galaxy
- `deargift_meta`: Metadata cho dashboard
- `deargift_demo_data`: Custom demo data
- `deargift_draft`: Auto-save form data

### Chuyển sang Backend
Để scale production, cần:
1. Tạo API endpoints:
   - `POST /api/galaxies` - Tạo galaxy mới
   - `GET /api/galaxies/:id` - Lấy galaxy theo ID
   - `DELETE /api/galaxies/:id` - Xóa galaxy
2. Upload service cho ảnh và audio
3. Database (MongoDB/PostgreSQL) thay vì localStorage

## 🎨 Themes và Customization

### Màu chính
- Pink: `#ff6b9d`
- Cyan: `#4ecdc4` 
- Blue: `#45b7d1`

### Responsive Breakpoints
- Desktop: > 768px
- Mobile: ≤ 768px
- Small Mobile: ≤ 480px

### Performance
- Tối ưu particle count cho mobile
- Lazy loading cho ảnh
- Auto-cleanup animations

## 🔧 Troubleshooting

### Galaxy không hiển thị
- Kiểm tra console errors
- Verify galaxy ID exists
- Check localStorage data

### Hiệu ứng lag trên mobile
- Giảm `maxParticles` trong `galaxy-viewer.js`
- Tắt một số animations phức tạp

### Audio không phát
- Browser cần user interaction để phát audio
- Check file format compatibility
- Verify file path

## 📱 Browser Support

- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support  
- **Safari**: ✅ Full support
- **Edge**: ✅ Full support
- **Mobile browsers**: ✅ Optimized

## 🎯 Roadmap

### Phiên bản tiếp theo
- [ ] User accounts và login
- [ ] Cloud storage cho ảnh/audio
- [ ] Templates có sẵn
- [ ] Analytics chi tiết
- [ ] Comments và reactions
- [ ] Export to video
- [ ] More animation effects
- [ ] Collaborative galaxy creation

## 💝 Credits

- **Fonts**: Google Fonts (Orbitron, Dancing Script)
- **QR Code**: QR Server API
- **Icons**: Unicode Emoji
- **Inspiration**: Sharing love and happiness through technology

---

💖 **DearGift** - Được tạo với yêu thương để lan tỏa hạnh phúc
