const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB kết nối thành công'))
.catch(err => console.error('MongoDB kết nối thất bại:', err));

// Tạo schema cho Galaxy và File
const fileSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String,
  size: Number,
  type: String,
  createdAt: { type: Date, default: Date.now },
  publicUrl: String
});

const galaxySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  messages: [String],
  icons: [String],
  colors: String,
  images: [String],
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  isHeart: Boolean,
  textHeart: String,
  isSave: Boolean,
  createdAt: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 0 }
});

const File = mongoose.model('File', fileSchema);
const Galaxy = mongoose.model('Galaxy', galaxySchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));
app.use(cors());

// Phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// API Upload file nhạc
app.post('/api/upload/music', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
    }

    const musicFile = req.files.file;
    
    // Kiểm tra loại file
    if (!musicFile.mimetype.startsWith('audio/')) {
      return res.status(400).json({ success: false, message: 'File không phải là file âm thanh' });
    }

    // Tạo tên file unique
    const filename = uuidv4() + '-' + musicFile.name.replace(/\\s+/g, '-');
    const filePath = path.join(__dirname, UPLOAD_DIR, filename);
    
    // Lưu file
    await musicFile.mv(filePath);

    // Lưu thông tin file vào database
    const fileInfo = new File({
      originalName: musicFile.name,
      filename: filename,
      path: filePath,
      size: musicFile.size,
      type: musicFile.mimetype,
      publicUrl: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    });
    
    await fileInfo.save();

    return res.status(200).json({
      success: true,
      file: {
        id: fileInfo._id,
        name: musicFile.name,
        url: fileInfo.publicUrl,
        size: musicFile.size,
        type: musicFile.mimetype
      }
    });

  } catch (error) {
    console.error('Lỗi upload file:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API Lưu galaxy
app.post('/api/galaxies', async (req, res) => {
  try {
    const galaxyData = req.body;
    
    // Kiểm tra dữ liệu bắt buộc
    if (!galaxyData.id || !galaxyData.messages || galaxyData.messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc (id, messages)' 
      });
    }

    // Kiểm tra xem galaxy đã tồn tại chưa
    const existingGalaxy = await Galaxy.findOne({ id: galaxyData.id });
    if (existingGalaxy) {
      return res.status(409).json({ 
        success: false, 
        message: 'Galaxy với ID này đã tồn tại' 
      });
    }

    // Tạo mới galaxy
    const galaxy = new Galaxy(galaxyData);
    await galaxy.save();

    return res.status(201).json({
      success: true,
      message: 'Galaxy đã được tạo thành công',
      galaxyId: galaxy.id
    });

  } catch (error) {
    console.error('Lỗi tạo galaxy:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API Lấy galaxy theo ID
app.get('/api/galaxies/:id', async (req, res) => {
  try {
    const galaxyId = req.params.id;
    const galaxy = await Galaxy.findOne({ id: galaxyId }).populate('song');
    
    if (!galaxy) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy galaxy với ID này' 
      });
    }

    // Tăng số lượt xem
    galaxy.viewCount += 1;
    await galaxy.save();

    return res.status(200).json({
      success: true,
      galaxy: {
        ...galaxy.toObject(),
        song: galaxy.song ? galaxy.song.publicUrl : null
      }
    });

  } catch (error) {
    console.error('Lỗi lấy galaxy:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API Lấy danh sách bài hát có sẵn
app.get('/api/songs', async (req, res) => {
  try {
    const songs = {
      love: [
        { id: "love1", name: "Anh Là Của Em - Karik ft. Lou Hoàng (Cover)", url: `${req.protocol}://${req.get('host')}/songs/anh_la_cua_em.mp4` },
        { id: "love2", name: "Yêu Là Tha Thu - Onlyc ft. Karik (Cover)", url: `${req.protocol}://${req.get('host')}/songs/yeu_la_tha_thu.mp4` },
        { id: "love3", name: "Có Chàng Trai Viết Lên Cây - Phan Mạnh Quỳnh (Cover)", url: `${req.protocol}://${req.get('host')}/songs/co_chang_trai_viet_len_cay.mp4` },
      ],
      birthday: [
        { id: "birthday1", name: "Chúc Mừng Sinh Nhật (Instrumental)", url: `${req.protocol}://${req.get('host')}/songs/chuc_mung_sinh_nhat.mp4` },
      ],
      trending: [
        { id: "trend1", name: "Anh Là Của Em (Popular Cover)", url: `${req.protocol}://${req.get('host')}/songs/anh_la_cua_em.mp4` },
        { id: "trend2", name: "Yêu Là Tha Thu (Trending)", url: `${req.protocol}://${req.get('host')}/songs/yeu_la_tha_thu.mp4` },
      ],
      instrumental: [
        { id: "inst1", name: "Piano Acoustic Cover", url: `${req.protocol}://${req.get('host')}/songs/co_chang_trai_viet_len_cay.mp4` },
      ]
    };

    return res.status(200).json({ success: true, songs });
  } catch (error) {
    console.error('Lỗi lấy danh sách bài hát:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Route kiểm tra trạng thái API
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'DearGift API đang hoạt động' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
