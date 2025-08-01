# DearGift Backend

Backend đơn giản cho ứng dụng DearGift để lưu trữ và upload nhạc.

## Cài đặt

1. Cài đặt Node.js và MongoDB
2. Clone repository
3. Di chuyển vào thư mục `backend`
4. Cài đặt các dependencies:

```bash
npm install
```

5. Tạo file `.env` với nội dung:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/deargift
UPLOAD_DIR=uploads
```

## Khởi động

```bash
npm start
```

Hoặc để development với auto-reload:

```bash
npm run dev
```

## API Endpoints

### Upload nhạc
- **POST** `/api/upload/music`
- Content-Type: multipart/form-data
- Body: file (audio file)

### Lưu galaxy
- **POST** `/api/galaxies`
- Content-Type: application/json
- Body: Galaxy object

### Lấy galaxy theo ID
- **GET** `/api/galaxies/:id`

### Lấy danh sách bài hát có sẵn
- **GET** `/api/songs`

### Kiểm tra trạng thái API
- **GET** `/api/status`
