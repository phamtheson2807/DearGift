# Hướng dẫn tích hợp Backend cho DearGift

Hướng dẫn này giúp bạn cấu hình và sử dụng backend mới thay thế cho Firebase trong dự án DearGift.

## Cài đặt Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt các dependencies:
```bash
npm install
```

3. Chỉnh sửa file `.env` nếu cần (mặc định sử dụng MongoDB local):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/deargift
UPLOAD_DIR=uploads
```

4. Khởi động MongoDB (nếu chưa khởi động):
```bash
# Windows
# Đảm bảo MongoDB đã được cài đặt, sau đó khởi động service

# Linux/Mac
mongod --dbpath=/data/db
```

5. Chạy backend server:
```bash
npm start
```

## Tích hợp với Frontend

Backend đã được tích hợp tự động trong `creator.js` với các tính năng:

1. **Auto-detect**: Frontend sẽ tự động phát hiện backend nếu đang chạy
2. **Fallback**: Nếu backend không khả dụng, sẽ tự động sử dụng localStorage
3. **API Client**: Sử dụng `deargift-api.js` để giao tiếp với backend

## Cấu hình CORS (nếu chạy trên domain khác)

Nếu bạn triển khai backend trên một domain khác với frontend, hãy cập nhật cấu hình CORS trong `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Thay đổi URL API trong frontend

Nếu backend không chạy trên `http://localhost:3000`, bạn cần cập nhật URL trong `deargift-api.js`:

```javascript
constructor(apiUrl = 'https://your-backend-domain.com/api') {
  this.apiUrl = apiUrl;
  // ...
}
```

## Kiểm tra trạng thái backend

Truy cập API endpoint sau để kiểm tra trạng thái của backend:

```
http://localhost:3000/api/status
```

## Quản lý dữ liệu

1. **MongoDB Compass**: Sử dụng để quản lý dữ liệu trong MongoDB
2. **API Endpoints**:
   - Danh sách bài hát: `GET /api/songs`
   - Upload nhạc: `POST /api/upload/music`
   - Lưu galaxy: `POST /api/galaxies`
   - Lấy galaxy: `GET /api/galaxies/:id`
