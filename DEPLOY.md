# 🚀 Hướng dẫn Deploy DearGift lên Web

## 📋 Chuẩn bị

Dự án đã sẵn sàng deploy với các file cấu hình:
- `netlify.toml` - Cấu hình Netlify
- `_redirects` - Xử lý routing
- `package.json` - Metadata dự án
- `.gitignore` - Loại trừ file không cần thiết

## 🌐 Phương pháp 1: Netlify (Khuyến nghị)

### Cách 1: Drag & Drop (Dễ nhất)
1. Truy cập [netlify.com](https://netlify.com)
2. Đăng ký/Đăng nhập tài khoản miễn phí
3. Vào Dashboard, chọn "Sites" 
4. Kéo thả toàn bộ thư mục `d:\khoa2408\galaxy` vào vùng "Deploy"
5. Đợi deploy hoàn tất (1-2 phút)
6. Nhận link miễn phí: `https://random-name.netlify.app`

### Cách 2: Qua Git (Tự động deploy)
1. Tạo repository trên GitHub:
   ```bash
   cd d:\khoa2408\galaxy
   git init
   git add .
   git commit -m "Initial commit: DearGift Galaxy"
   git branch -M main
   git remote add origin https://github.com/USERNAME/deargift-galaxy.git
   git push -u origin main
   ```

2. Connect Netlify với GitHub:
   - Chọn "New site from Git"
   - Connect GitHub
   - Chọn repository `deargift-galaxy`
   - Deploy settings:
     - Build command: (để trống)
     - Publish directory: `.`
   - Deploy site

## 🌐 Phương pháp 2: Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập với GitHub
3. Import repository
4. Deploy với settings mặc định

## 🌐 Phương pháp 3: GitHub Pages

1. Tạo repository public trên GitHub
2. Upload code
3. Vào Settings > Pages
4. Source: Deploy from branch `main`
5. Link sẽ là: `https://username.github.io/deargift-galaxy`

## 🌐 Phương pháp 4: Firebase Hosting

```bash
# Cài đặt Firebase CLI
npm install -g firebase-tools

# Đăng nhập
firebase login

# Khởi tạo project
cd d:\khoa2408\galaxy
firebase init hosting

# Deploy
firebase deploy
```

## ⚡ Tối ưu hóa sau khi deploy

### 1. Cấu hình Custom Domain (Netlify)
- Mua domain từ Namecheap, GoDaddy...
- Vào Netlify > Domain settings
- Add custom domain
- Cấu hình DNS records

### 2. SSL Certificate
- Netlify/Vercel tự động cấp SSL miễn phí
- Website sẽ có `https://`

### 3. Performance
- Netlify tự động minify HTML/CSS/JS
- CDN global
- Gzip compression

## 🔧 Troubleshooting

### Lỗi routing 404
- Đảm bảo có file `_redirects`
- Kiểm tra cấu hình trong `netlify.toml`

### Links không hoạt động
- Sử dụng relative paths (`./file.html`)
- Không dùng `file://` protocol

### localStorage không persist
- Normal behavior trên web
- Cần backend cho persistent storage

## 📊 Monitoring

### Analytics miễn phí:
- Google Analytics
- Netlify Analytics
- Vercel Analytics

### Performance:
- Lighthouse (Chrome DevTools)
- GTmetrix
- PageSpeed Insights

## 🆙 Upgrade to Backend

Khi cần scale lớn hơn:
1. **Database**: MongoDB Atlas, Supabase
2. **API**: Node.js, Python Flask/Django
3. **File upload**: Cloudinary, AWS S3
4. **Auth**: Auth0, Firebase Auth

## ✅ Checklist Deploy

- [ ] Test tất cả links
- [ ] Kiểm tra responsive
- [ ] Test trên nhiều browser
- [ ] Optimize images
- [ ] Check console errors
- [ ] Set up analytics
- [ ] Configure SEO meta tags
- [ ] Test sharing features

---

🎉 **Chúc mừng!** DearGift của bạn đã sẵn sàng lan tỏa yêu thương trên toàn thế giới! 🌍💖
