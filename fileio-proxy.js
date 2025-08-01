const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

app.use(cors());

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Tạo form data để gửi lên file.io
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    // Upload lên file.io
    const response = await fetch('https://file.io/', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`File.io proxy server running on port ${PORT}`));