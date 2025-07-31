// --- Firebase Firestore ---
// Thêm đoạn này vào đầu file (sau các biến global)
// Firebase SDK đã được thêm vào HTML
const firebaseConfig = {
  apiKey: "AIzaSyDsQzklj9EplxSPFltI3kRVjzIu8DILwko",
  authDomain: "deargift-f780b.firebaseapp.com",
  projectId: "deargift-f780b",
  storageBucket: "deargift-f780b.appspot.com",
  messagingSenderId: "329430119253",
  appId: "1:329430119253:web:71a099c215370092eeb5dc",
  measurementId: "G-NSJHP66HKW",
};
if (!firebase.apps.length) {
  console.log('Initializing Firebase app...');
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
} else {
  console.log('Firebase app already exists');
}

const db = firebase.firestore();
const storage = firebase.storage(); // Add Firebase Storage
console.log('Firebase services initialized:', {
  firestore: !!db,
  storage: !!storage
});

// Make storage globally available
window.storage = storage;

// Initialize Firebase Music Uploader after Firebase is ready
setTimeout(async () => {
  console.log('Attempting to initialize Firebase Music Uploader...');
  if (window.initializeFirebaseMusicUploader) {
    try {
      await window.initializeFirebaseMusicUploader();
      console.log('Firebase Music Uploader initialization completed');
    } catch (error) {
      console.error('Firebase Music Uploader initialization failed:', error);
    }
  } else {
    console.error('initializeFirebaseMusicUploader function not found');
  }
}, 1500); // Wait 1.5 seconds for Firebase to be fully ready

// Initialize stars background
function createStars() {
  const starsContainer = document.getElementById("stars");
  const starCount = window.innerWidth < 768 ? 100 : 200;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    starsContainer.appendChild(star);
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  createStars();
  initializeFormHandlers();
  loadAvailableSongs();
});

// Available songs data - chỉ sử dụng file thực tế đã tải
const availableSongs = {
  love: [
    { id: "love1", name: "Anh Là Của Em - Karik ft. Lou Hoàng (Cover)", url: "./songs/anh_la_cua_em.mp4" },
    { id: "love2", name: "Yêu Là Tha Thu - Onlyc ft. Karik (Cover)", url: "./songs/yeu_la_tha_thu.mp4" },
    { id: "love3", name: "Có Chàng Trai Viết Lên Cây - Phan Mạnh Quỳnh (Piano Cover)", url: "./songs/co_chang_trai_viet_len_cay.mp4" }
  ],
  birthday: [
    { id: "birthday1", name: "Chúc Mừng Sinh Nhật (Instrumental)", url: "./songs/chuc_mung_sinh_nhat.mp4" }
  ],
  trending: [
    { id: "trend1", name: "Anh Là Của Em (Popular Cover)", url: "./songs/anh_la_cua_em.mp4" },
    { id: "trend2", name: "Yêu Là Tha Thu (Trending)", url: "./songs/yeu_la_tha_thu.mp4" }
  ],
  instrumental: [
    { id: "inst1", name: "Piano Acoustic Cover", url: "./songs/co_chang_trai_viet_len_cay.mp4" }
  ]
};

let selectedSong = null;
let uploadedMusicFile = null; // Store uploaded music file

// Handle music file upload
async function handleMusicUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // Create upload status element
    const uploadStatus = document.getElementById('uploadStatus') || createUploadStatus();
    uploadStatus.innerHTML = '📤 Đang tải lên Firebase...';
    uploadStatus.style.color = '#ff6b9d';
    
        // Wait for Smart Music Uploader to be ready
    if (!window.smartMusicUploader) {
      uploadStatus.innerHTML = '⏳ Đang khởi tạo Music Uploader...';
      
      // Wait a bit for smart uploader to initialize
      let attempts = 0;
      while (!window.smartMusicUploader && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.smartMusicUploader) {
        throw new Error('Music Uploader không khả dụng');
      }
    }
    
    // Use Smart Music Uploader (auto-detects Firebase vs Blob)
    uploadStatus.innerHTML = '📤 Đang tải lên (0%)...';
    
    const uploadResult = await window.smartMusicUploader.uploadMusic(file, (progress) => {
      uploadStatus.innerHTML = `📤 Đang tải lên (${progress.toFixed(1)}%)...`;
    });
    
    console.log('Upload result:', uploadResult);
    
    // Store file info with upload URL
    uploadedMusicFile = {
      file: file,
      originalName: uploadResult.originalName,
      fileName: uploadResult.fileName,
      url: uploadResult.downloadURL, // Use download URL (Firebase or Blob)
      size: uploadResult.size,
      type: uploadResult.type,
      storageRef: uploadResult.storageRef,
      uploadedAt: uploadResult.uploadedAt,
      isFirebaseUpload: !uploadResult.isBlobUpload,
      isBlobUpload: uploadResult.isBlobUpload || false
    };
    
    // Clear preset selection when uploading
    selectedSong = null;
    const allSongItems = document.querySelectorAll('.song-item');
    allSongItems.forEach(item => item.classList.remove('selected'));
    
    console.log('Music file uploaded:', uploadedMusicFile);
    
    // Show success message
    const uploadType = uploadedMusicFile.isFirebaseUpload ? 'Firebase Storage' : 'Local (Development)';
    uploadStatus.innerHTML = `✅ Đã tải lên ${uploadType}: ${uploadResult.originalName} (${(uploadResult.size / 1024 / 1024).toFixed(2)}MB)`;
    uploadStatus.style.color = '#4CAF50';
    
    // Auto-preview uploaded music
    setTimeout(() => {
      if (uploadedMusicFile.url && typeof window.previewMusic === 'function') {
        window.previewMusic(uploadedMusicFile.url, uploadedMusicFile.originalName);
      }
    }, 500);
    
  } catch (error) {
    console.error('Error uploading music to Firebase:', error);
    
    const uploadStatus = document.getElementById('uploadStatus') || createUploadStatus();
    uploadStatus.innerHTML = `❌ Lỗi: ${error.message}`;
    uploadStatus.style.color = '#f44336';
    
    // Clear the file input
    event.target.value = '';
    uploadedMusicFile = null;
  }
}

function createUploadStatus() {
  const status = document.createElement('div');
  status.id = 'uploadStatus';
  status.style.cssText = 'margin-top: 10px; padding: 8px; border-radius: 5px; font-size: 14px;';
  document.getElementById('uploadMusic').appendChild(status);
  return status;
}
let previewAudio = null;

// Music tab functions
function showMusicTab(tab) {
  const presetTab = document.getElementById('presetTab');
  const uploadTab = document.getElementById('uploadTab');
  const presetContent = document.getElementById('presetMusic');
  const uploadContent = document.getElementById('uploadMusic');
  
  // Reset tabs
  presetTab.classList.remove('active');
  uploadTab.classList.remove('active');
  presetContent.style.display = 'none';
  uploadContent.style.display = 'none';
  
  // Show selected tab
  if (tab === 'preset') {
    presetTab.classList.add('active');
    presetContent.style.display = 'block';
  } else {
    uploadTab.classList.add('active');
    uploadContent.style.display = 'block';
  }
  
  // Clear selected song when switching tabs
  selectedSong = null;
  if (typeof window.stopPreview === 'function') {
    window.stopPreview();
  }
}

function loadAvailableSongs() {
  console.log('Available songs loaded:', availableSongs);
}

function loadSongsByCategory() {
  const category = document.getElementById('musicCategory').value;
  const songList = document.getElementById('songList');
  const songsContainer = songList.querySelector('.songs-container');
  
  if (!category) {
    songList.style.display = 'none';
    return;
  }
  
  const songs = availableSongs[category] || [];
  songsContainer.innerHTML = '';
  
  songs.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.innerHTML = `
      <span class="song-name">${song.name}</span>
      <button type="button" class="song-preview" onclick="previewSong('${song.url}', '${song.id}')" title="Nghe thử">
        ▶️
      </button>
    `;
    
    songItem.addEventListener('click', function(e) {
      if (e.target.classList.contains('song-preview')) return;
      selectSong(song, songItem);
    });
    
    songsContainer.appendChild(songItem);
  });
  
  songList.style.display = 'block';
}

function selectSong(song, element) {
  // Remove previous selection
  document.querySelectorAll('.song-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Select current song
  element.classList.add('selected');
  selectedSong = song;
  
  console.log('Selected song:', song);
}

// Handle demo preview functionality (integrated from create.html)
async function handleDemoPreview() {
  const messageInput = document.getElementById("message");
  if (!messageInput) return;
  
  const userMessage = messageInput.value.trim();
  
  // Check for music input (both types)
  const musicFile = document.getElementById('backgroundMusic')?.files[0] || 
                    document.getElementById('customSongFile')?.files[0];
  
  let musicBase64 = null;
  
  if (musicFile) {
    try {
      // Convert to base64 for demo mode
      musicBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(musicFile);
      });
    } catch (error) {
      console.warn("Couldn't convert music for demo:", error);
      // Continue without music
    }
  }
  
  // Create demo data with user's input
  const demoData = {
    id: 'demo-' + Date.now(),
    title: 'Demo Galaxy',
    message: userMessage || 'Welcome to your galaxy preview!',
    creator: 'Demo User',
    createdAt: new Date().toISOString(),
    musicUrl: musicBase64 || null,
    musicVolume: 0.5,
    isDemo: true
  };
  
  // Store in localStorage temporarily for demo
  localStorage.setItem('temp_demo_galaxy', JSON.stringify(demoData));
  
  // Open demo in new tab
  const demoUrl = `index.html?demo=1&tempId=${demoData.id}`;
  window.open(demoUrl, '_blank');
}

function previewSong(url, songId) {
  // Use the global previewMusic function from creator.html
  if (typeof window.previewMusic === 'function') {
    const songName = availableSongs[Object.keys(availableSongs).find(cat => 
      availableSongs[cat].some(s => s.id === songId)
    )]?.find(s => s.id === songId)?.name || 'Unknown Song';
    
    window.previewMusic(url, songName);
  } else {
    console.error('previewMusic function not found');
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  createStars();
  initializeFormHandlers();
  loadAvailableSongs();
});

// Form handlers
function initializeFormHandlers() {
  const form = document.getElementById("galaxyForm");
  const iconsInput = document.getElementById("iconsInput");
  const colorPicker = document.getElementById("messageColor");
  const colorPreview = document.getElementById("colorPreview");
  const colorHex = document.getElementById("colorHex");
  const imagesInput = document.getElementById("images");

  // Handle form submission
  form.addEventListener("submit", handleFormSubmit);

  // Handle icons input
  iconsInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addIcon(this.value.trim());
      this.value = "";
    }
  });

  // Handle color picker
  colorPicker.addEventListener("change", function () {
    const color = this.value;
    colorPreview.style.backgroundColor = color;
    colorHex.value = color;
  });

  colorHex.addEventListener("input", function () {
    const color = this.value;
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      colorPicker.value = color;
      colorPreview.style.backgroundColor = color;
    }
  });

  colorPreview.addEventListener("click", function () {
    colorPicker.click();
  });

  // Handle image upload
  imagesInput.addEventListener("change", handleImageUpload);

  // Handle music upload - Enhanced version
  const musicInput = document.getElementById("backgroundMusic");
  if (musicInput) {
    musicInput.addEventListener("change", handleEnhancedMusicUpload);
  }
  
  // Also handle custom song file input if it exists (for compatibility)
  const customSongFile = document.getElementById("customSongFile");
  if (customSongFile) {
    customSongFile.addEventListener("change", handleEnhancedMusicUpload);
  }

  // Handle demo preview button (integrated from create.html)
  const viewDemoBtn = document.getElementById("viewDemoBtn");
  if (viewDemoBtn) {
    viewDemoBtn.addEventListener("click", handleDemoPreview);
  }
  const fileInputLabel = document.querySelector(".file-input-label");
  fileInputLabel.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.borderColor = "#ff6b9d";
    this.style.backgroundColor = "rgba(255, 107, 157, 0.2)";
  });

  fileInputLabel.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.style.borderColor = "rgba(255, 107, 157, 0.5)";
    this.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
  });

  fileInputLabel.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.borderColor = "rgba(255, 107, 157, 0.5)";
    this.style.backgroundColor = "rgba(255, 255, 255, 0.05)";

    const files = e.dataTransfer.files;
    handleImageFiles(files);
  });
}

// Global variables
let iconsArray = ["❤️", "💖", "💕"];
let imagesArray = [];

// Add icon to tags
function addIcon(icon) {
  if (icon && !iconsArray.includes(icon)) {
    iconsArray.push(icon);
    updateIconsDisplay();
  }
}

// Remove icon from tags
function removeIcon(index) {
  iconsArray.splice(index, 1);
  updateIconsDisplay();
}

// Update icons display
function updateIconsDisplay() {
  const container = document.getElementById("iconsTags");
  container.innerHTML = "";

  iconsArray.forEach((icon, index) => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `
            ${icon}
            <span class="remove" onclick="removeIcon(${index})">×</span>
        `;
    container.appendChild(tag);
  });
}

// Handle image upload
function handleImageUpload(e) {
  handleImageFiles(e.target.files);
}

// Handle image files
function handleImageFiles(files) {
  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // Tạo canvas để resize ảnh
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Giới hạn kích thước ảnh để tránh quá lớn
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Chuyển thành base64 với chất lượng nén
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

          imagesArray.push({
            name: file.name,
            data: compressedDataUrl,
            url: compressedDataUrl,
          });
          updateImagesDisplay();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Remove image
function removeImage(index) {
  imagesArray.splice(index, 1);
  updateImagesDisplay();
}

// Update images display
function updateImagesDisplay() {
  const container = document.getElementById("previewImages");
  container.innerHTML = "";

  imagesArray.forEach((image, index) => {
    const div = document.createElement("div");
    div.className = "preview-image";
    div.innerHTML = `
            <img src="${image.url}" alt="${image.name}">
            <button class="remove" onclick="removeImage(${index})">×</button>
        `;
    container.appendChild(div);
  });
}

// Generate unique ID
function generateGalaxyId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return timestamp + randomStr;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const loading = document.getElementById("loading");
  const resultContainer = document.getElementById("resultContainer");
  const submitBtn = document.querySelector("#galaxyForm button[type='submit']");

  // Show loading and disable submit
  loading.style.display = "block";
  resultContainer.style.display = "none";
  if (submitBtn) submitBtn.disabled = true;

  try {
    // Get form data (now async to handle music file conversion)
    const formData = await getFormData();

    // Validate form data
    if (!validateFormData(formData)) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
    }

    // Generate galaxy ID
    const galaxyId = generateGalaxyId();

    // Create galaxy data
    const galaxyData = {
      id: galaxyId,
      messages: formData.messages,
      icons: formData.icons,
      colors: formData.color,
      images: formData.images,
      song: formData.music,
      isHeart: formData.enableHeart,
      textHeart: formData.heartText,
      isSave: !formData.hideFooter,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    };

    // Save to localStorage and backend
    await saveGalaxyData(galaxyId, galaxyData);

    // Generate links
    let productionBaseUrl;
    if (
      window.location.origin.includes("localhost") ||
      window.location.origin.includes("127.0.0.1") ||
      window.location.protocol === "file:"
    ) {
      // Nếu đang ở localhost, dùng production URL
      productionBaseUrl = "https://deargiftt.netlify.app/";
    } else {
      // Nếu đang ở production, dùng URL hiện tại
      productionBaseUrl = window.location.origin + "/";
    }

    const galaxyLink = `${productionBaseUrl}index.html?id=${galaxyId}`;
    const shareLink = `${productionBaseUrl}index.html?id=${galaxyId}`;

    // Debug log
    console.log("Generated galaxy ID:", galaxyId);
    console.log("Production base URL:", productionBaseUrl);
    console.log("Final galaxy link:", galaxyLink);

    // Show result
    showResult(galaxyLink, shareLink, galaxyId);
  } catch (error) {
    alert("Có lỗi xảy ra: " + error.message);
    if (error && error.stack) {
      console.error("Chi tiết lỗi Firestore:", error.stack);
    } else {
      console.error("Chi tiết lỗi Firestore:", error);
    }
  } finally {
    loading.style.display = "none";
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Get form data
async function getFormData() {
  const messages = document
    .getElementById("messages")
    .value.split("\n")
    .filter((msg) => msg.trim())
    .map((msg) => msg.trim());

  const color = document.getElementById("messageColor").value;
  const heartText = document.getElementById("heartText").value.trim();
  const enableHeart = document.getElementById("enableHeart").checked;
  const hideFooter = document.getElementById("hideFooter").checked;

  // Handle music selection with priority order
  let musicData = null;
  
  // Priority 1: Check if custom music file was uploaded via the uploader
  if (uploadedMusicFile && uploadedMusicFile.url) {
    musicData = uploadedMusicFile.url;
    console.log('Using uploaded music file:', uploadedMusicFile);
  } 
  // Priority 2: Check if a preset song is selected
  else if (selectedSong) {
    musicData = selectedSong.url;
    console.log('Using preset song:', selectedSong);
  } 
  // Priority 3: Fallback to legacy file input (for backward compatibility)
  else {
    const musicFile = document.getElementById("backgroundMusic").files[0];
    if (musicFile) {
      // For demo: convert to base64 for localStorage
      try {
        musicData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(musicFile);
        });
        console.log('Using legacy file input as base64');
      } catch (error) {
        console.error('Error converting music file to base64:', error);
        musicData = null;
      }
    }
  }

  return {
    messages,
    icons: iconsArray,
    color,
    images: imagesArray.map((img) => img.url),
    music: musicData,
    heartText: heartText || "Dear You",
    enableHeart,
    hideFooter,
  };
}

// Validate form data
function validateFormData(data) {
  if (!data.messages || data.messages.length === 0) {
    alert("Vui lòng nhập ít nhất một tin nhắn");
    return false;
  }

  if (!data.icons || data.icons.length === 0) {
    alert("Vui lòng thêm ít nhất một biểu tượng");
    return false;
  }

  return true;
}

// Smart Music Upload Handler (integrated from create.html)
async function handleSmartMusicUpload(file, progressCallback) {
  console.log('Starting smart music upload for file:', file.name);
  
  // Validate file
  if (!file || !file.type.startsWith('audio/')) {
    throw new Error('File không phải là file âm thanh hợp lệ');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File âm thanh vượt quá 10MB!');
  }
  
  try {
    // Try Firebase Storage first if available
    if (window.smartMusicUploader) {
      console.log('Using Smart Music Uploader (Firebase + Blob fallback)');
      const result = await window.smartMusicUploader.uploadMusic(file, progressCallback);
      return {
        url: result.downloadURL,
        originalName: result.originalName,
        fileName: result.fileName,
        size: result.size,
        type: result.type,
        isFirebaseUpload: !result.isBlobUpload,
        uploadedAt: result.uploadedAt || new Date().toISOString()
      };
    } else {
      // Fallback to base64 conversion (like create.html demo mode)
      console.log('Using base64 fallback for music upload');
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Simulate progress for UI feedback
      if (progressCallback) {
        for (let i = 0; i <= 100; i += 10) {
          setTimeout(() => progressCallback(i), i * 10);
        }
      }
      
      return {
        url: base64Data,
        originalName: file.name,
        fileName: `base64_${Date.now()}_${file.name}`,
        size: file.size,
        type: file.type,
        isFirebaseUpload: false,
        isBlobUpload: false,
        isBase64: true,
        uploadedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Music upload failed:', error);
    throw new Error(`Upload thất bại: ${error.message}`);
  }
}

// Enhanced music upload handler
async function handleEnhancedMusicUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const uploadStatus = document.getElementById('musicUploadStatus') || 
    (() => {
      // Create upload status element if it doesn't exist
      const status = document.createElement('div');
      status.id = 'musicUploadStatus';
      status.style.cssText = `
        margin-top: 10px;
        padding: 8px;
        border-radius: 6px;
        background: rgba(255, 107, 157, 0.1);
        border: 1px solid rgba(255, 107, 157, 0.3);
        color: #ff6b9d;
        font-size: 13px;
        display: none;
      `;
      e.target.parentNode.appendChild(status);
      return status;
    })();
  
  uploadStatus.style.display = 'block';
  uploadStatus.innerHTML = '⏳ Chuẩn bị upload nhạc...';
  
  try {
    const result = await handleSmartMusicUpload(file, (progress) => {
      uploadStatus.innerHTML = `📤 Đang upload nhạc (${progress.toFixed(1)}%)...`;
    });
    
    // Store uploaded music info globally
    uploadedMusicFile = result;
    
    // Clear preset selection when uploading custom music
    selectedSong = null;
    const allSongItems = document.querySelectorAll('.song-item');
    allSongItems.forEach(item => item.classList.remove('selected'));
    
    console.log('Enhanced music upload completed:', result);
    
    // Show success message
    const uploadType = result.isFirebaseUpload ? 'Firebase Storage' : 
                      result.isBlobUpload ? 'Local (Development)' : 'Base64 (Demo)';
    uploadStatus.innerHTML = `✅ Upload thành công via ${uploadType}: ${result.originalName} (${(result.size / 1024 / 1024).toFixed(2)}MB)`;
    uploadStatus.style.color = '#4CAF50';
    
  } catch (error) {
    console.error('Enhanced music upload error:', error);
    uploadStatus.innerHTML = `❌ Upload thất bại: ${error.message}`;
    uploadStatus.style.color = '#f44336';
    uploadedMusicFile = null;
  }
}

// Save galaxy data
async function saveGalaxyData(id, data) {
  // Save to localStorage as backup
  const existingData = JSON.parse(
    localStorage.getItem("deargift_galaxies") || "{}"
  );
  existingData[id] = data;
  localStorage.setItem("deargift_galaxies", JSON.stringify(existingData));

  // Debug log
  console.log("Galaxy saved with ID:", id);
  console.log("Galaxy data:", data);

  // Lưu lên Firestore (đảm bảo luôn lưu, không chỉ thử/catch)
  try {
    await db.collection("galaxies").doc(id).set(data);
    console.log("Galaxy saved to Firestore:", id);
  } catch (error) {
    // Nếu lỗi Firestore, vẫn cho phép local dùng được, nhưng cảnh báo rõ ràng
    alert(
      "Lưu lên server thất bại, chỉ lưu tạm trên máy bạn. Vui lòng thử lại hoặc kiểm tra kết nối mạng!"
    );
    console.error("Error saving to Firestore:", error);
  }

  // Also save metadata for listing (local)
  const metadata = {
    id,
    title: data.messages[0] || "Untitled Galaxy",
    createdAt: data.createdAt,
    viewCount: 0,
  };

  const existingMeta = JSON.parse(
    localStorage.getItem("deargift_meta") || "[]"
  );
  existingMeta.push(metadata);
  localStorage.setItem("deargift_meta", JSON.stringify(existingMeta));
}

// Show result
function showResult(galaxyLink, shareLink, galaxyId) {
  console.log("=== DEBUG showResult ===");
  console.log("galaxyLink:", galaxyLink);
  console.log("shareLink:", shareLink);
  console.log("galaxyId:", galaxyId);

  const resultContainer = document.getElementById("resultContainer");
  const galaxyLinkInput = document.getElementById("galaxyLink");
  const qrCodeContainer = document.getElementById("qrCode");

  console.log("resultContainer:", resultContainer);
  console.log("galaxyLinkInput:", galaxyLinkInput);
  console.log("qrCodeContainer:", qrCodeContainer);

  // Kiểm tra và set galaxy link trước
  if (galaxyLinkInput && galaxyLink) {
    galaxyLinkInput.value = galaxyLink;
    console.log("Galaxy link set to input:", galaxyLinkInput.value);
  }

  // Chỉ tạo QR code khi có link hợp lệ và container tồn tại
  if (qrCodeContainer && galaxyLink && galaxyLink.trim()) {
    console.log("About to generate QR code with URL:", galaxyLink);
    // Thêm delay nhỏ để đảm bảo DOM đã sẵn sàng
    setTimeout(() => {
      generateQRCode(galaxyLink, qrCodeContainer);
    }, 100);
  } else {
    console.error("QR code generation skipped:", {
      qrCodeContainer: !!qrCodeContainer,
      galaxyLink: galaxyLink,
      galaxyLinkTrimmed: galaxyLink ? galaxyLink.trim() : "null",
    });
  }

  if (resultContainer) {
    resultContainer.style.display = "block";
  }

  // Smooth scroll to result
  setTimeout(() => {
    resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 200);
}

// Generate QR code
function generateQRCode(url, container) {
  console.log("=== DEBUG generateQRCode ===");
  console.log("Input URL:", url);
  console.log("URL type:", typeof url);
  console.log("URL length:", url ? url.length : "null");

  // Kiểm tra URL hợp lệ trước khi tạo QR
  if (!url || !url.trim()) {
    console.error("URL is empty or null");
    container.innerHTML = `
            <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; text-align: center;">
                <p style="margin: 0; color: #ff6b9d;">⚠️ Không thể tạo QR Code</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Link chưa được tạo</p>
            </div>
        `;
    return;
  }

  // Kiểm tra format URL
  try {
    const testUrl = new URL(url);
    console.log("URL parsed successfully:", testUrl.href);
    if (!testUrl.protocol.startsWith("http")) {
      throw new Error("Invalid protocol: " + testUrl.protocol);
    }
  } catch (error) {
    console.error("URL parsing failed:", error);
    container.innerHTML = `
            <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; text-align: center;">
                <p style="margin: 0; color: #ff6b9d;">⚠️ Không thể tạo QR Code</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Link không hợp lệ: ${error.message}</p>
            </div>
        `;
    return;
  }

  // Tạo QR code với URL đã được validate
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    url
  )}`;
  console.log("QR API URL:", qrUrl);

  container.innerHTML = `
        <h4 style="margin-bottom: 15px; color: #4ecdc4;">📱 QR Code để chia sẻ</h4>
        <img id="qrImage" src="${qrUrl}" 
             alt="QR Code" 
             style="border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); max-width: 150px;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div style="display: none; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; text-align: center;">
            <p style="margin: 0; color: #ff6b9d;">⚠️ Không thể tạo QR Code</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Vui lòng copy link để chia sẻ</p>
        </div>
        <p style="margin-top: 10px; font-size: 12px; opacity: 0.8;">Quét mã QR để mở trên điện thoại</p>
        <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 10px; word-break: break-all;">
            <strong>Debug URL:</strong> ${url}
        </div>
    `;
}

// Copy link functions
function copyLink() {
  const linkInput = document.getElementById("galaxyLink");
  linkInput.select();
  linkInput.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(linkInput.value).then(() => {
    showToast("✅ Đã sao chép link Galaxy!");
  });
}

// Preview galaxy
function previewGalaxy() {
  const link = document.getElementById("galaxyLink").value;
  window.open(link, "_blank");
}

// Create new galaxy
function createNew() {
  if (
    confirm("Bạn có chắc muốn tạo galaxy mới? Thông tin hiện tại sẽ bị xóa.")
  ) {
    location.reload();
  }
}

// Show toast notification
function showToast(message) {
  // Create toast element
  const toast = document.createElement("div");
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4ecdc4;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Initialize icons display on page load
document.addEventListener("DOMContentLoaded", function () {
  updateIconsDisplay();
});

// Auto-save functionality (optional)
function autoSave() {
  const formData = {
    messages: document.getElementById("messages").value,
    icons: iconsArray,
    color: document.getElementById("messageColor").value,
    heartText: document.getElementById("heartText").value,
    enableHeart: document.getElementById("enableHeart").checked,
    hideFooter: document.getElementById("hideFooter").checked,
  };

  localStorage.setItem("deargift_draft", JSON.stringify(formData));
}

// Load auto-saved data
function loadAutoSave() {
  const draft = localStorage.getItem("deargift_draft");
  if (draft) {
    try {
      const data = JSON.parse(draft);

      // Kiểm tra elements tồn tại trước khi set value
      const messagesEl = document.getElementById("messages");
      const colorEl = document.getElementById("messageColor");
      const colorHexEl = document.getElementById("colorHex");
      const colorPreviewEl = document.getElementById("colorPreview");
      const heartTextEl = document.getElementById("heartText");
      const enableHeartEl = document.getElementById("enableHeart");
      const hideFooterEl = document.getElementById("hideFooter");

      if (messagesEl) messagesEl.value = data.messages || "";
      if (colorEl) colorEl.value = data.color || "#ff6b9d";
      if (colorHexEl) colorHexEl.value = data.color || "#ff6b9d";
      if (colorPreviewEl)
        colorPreviewEl.style.backgroundColor = data.color || "#ff6b9d";
      if (heartTextEl) heartTextEl.value = data.heartText || "";
      if (enableHeartEl) enableHeartEl.checked = data.enableHeart !== false;
      if (hideFooterEl) hideFooterEl.checked = data.hideFooter || false;

      if (data.icons) {
        iconsArray = data.icons;
        updateIconsDisplay();
      }
    } catch (error) {
      console.warn("Error loading auto-save:", error);
    }
  }
}

// Auto-save every 30 seconds
setInterval(autoSave, 30000);

// Load auto-save on page load
document.addEventListener("DOMContentLoaded", loadAutoSave);
