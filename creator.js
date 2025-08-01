// --- DearGift Backend API ---
// Khởi tạo các biến và hàm cần thiết trước khi dùng
if (typeof window.uploadedMusicFile === 'undefined') window.uploadedMusicFile = null;
if (typeof window.selectedSong === 'undefined') window.selectedSong = null;
if (typeof window.audioEnabled === 'undefined') window.audioEnabled = true;
if (typeof window.availableSongs === 'undefined') window.availableSongs = null;
if (typeof window.previewAudio === 'undefined') window.previewAudio = null;

// Kiểm tra và tạo API client nếu chưa tồn tại
if (typeof window.dearGiftAPI === 'undefined') {
  console.log('Initializing DearGift API client...');
  // API client sẽ được tải từ deargift-api.js
  // Hoặc tạo một instance mới nếu chưa được tải
  window.dearGiftAPI = {
    isInitialized: false,
    init: async function() {
      console.log('Checking backend API connection...');
      try {
        const response = await fetch('http://localhost:3000/api/status');
        if (response.ok) {
          const data = await response.json();
          this.isInitialized = true;
          console.log('Backend API connected:', data);
          return true;
        }
      } catch (err) {
        console.warn('Backend API connection failed, using localStorage fallback');
      }
      return false;
    }
  };
  
  // Khởi tạo API
  window.dearGiftAPI.init()
    .then(result => console.log('API initialization completed:', result))
    .catch(err => console.error('API initialization error:', err));
}

console.log('DearGift backend initialized');

// Tạo shorthand để truy cập API dễ dàng hơn
const api = window.dearGiftAPI;

// Đảm bảo khởi tạo Backend API đúng cách
(function setupBackendAPI() {
  // Khởi tạo các biến toàn cục cần thiết trước khi sử dụng
  window.uploadedMusicFile = null;
  window.selectedSong = null;
  window.audioEnabled = true;
  
  // Khởi tạo Music Uploader sử dụng backend API
  window.initializeFirebaseMusicUploader = async function() {
    console.log('DearGift Music Uploader initialized');
    
    try {
      // Kiểm tra API client đã được khởi tạo chưa
      if (!window.dearGiftAPI) {
        console.warn('DearGift API client chưa được khởi tạo');
        return false;
      }
      
      try {
        // Kiểm tra kết nối API với timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API connection timeout')), 5000)
        );
        
        const connectionPromise = window.dearGiftAPI.checkConnection 
          ? window.dearGiftAPI.checkConnection() 
          : Promise.resolve(false);
          
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (isConnected) {
          console.log('Backend API connection verified successfully');
        } else {
          console.warn('Backend API connection check failed, sẽ sử dụng localStorage');
          // We'll continue anyway as we can work with localStorage
        }
      } catch (connErr) {
        console.warn('API connection check failed:', connErr.message);
      }
      
      // Initialize any needed variables for music upload
      window.uploadedMusicFile = null;
      window.selectedSong = null;
      window.audioEnabled = true;
      
      return true;
    } catch (err) {
      console.warn('API connection check failed:', err.message);
      // Still continue, as we can work with localStorage
      return false;
    }
  };
  
  // Khởi tạo music upload handler mới sử dụng backend API
  window.uploadMusicWithAPI = async function(file) {
    try {
      if (!window.dearGiftAPI || !window.dearGiftAPI.uploadMusic) {
        throw new Error('API client chưa sẵn sàng');
      }
      
      return await window.dearGiftAPI.uploadMusic(file);
    } catch (error) {
      console.error('Lỗi upload nhạc qua API:', error);
      
      // Fallback to blob URL method
      console.log('Fallback to blob URL method');
      const blobUrl = URL.createObjectURL(file);
      
      return {
        url: blobUrl,
        originalName: file.name,
        size: file.size,
        type: file.type,
        isBlobUrl: true,
        uploadedAt: new Date().toISOString()
      };
    }
  };
  
  // Immediate execution with safety checks and better retry logic
  let retryCount = 0;
  const maxRetries = 3;
  
  function attemptInitialize() {
    try {
      if (typeof window.initializeFirebaseMusicUploader === 'function') {
        window.initializeFirebaseMusicUploader()
          .then(() => console.log('Music Uploader initialization completed'))
          .catch(err => {
            console.error('Music Uploader initialization error:', err);
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying initialization (${retryCount}/${maxRetries})...`);
              setTimeout(attemptInitialize, 1500);
            }
          });
      } else {
        console.warn('Music Uploader function không được định nghĩa đúng cách');
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying initialization (${retryCount}/${maxRetries})...`);
          setTimeout(attemptInitialize, 1500);
        }
      }
    } catch (error) {
      console.error('Music Uploader initialization failed:', error);
    }
  }
  
  // Đợi API được khởi tạo trước
  setTimeout(attemptInitialize, 1000);
})();

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

// Form initialization handlers
function initializeFormHandlers() {
  // Initialize icon input
  const iconInput = document.getElementById('iconsInput');
  if (iconInput) {
    iconInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const icon = this.value.trim();
        if (icon) {
          addIcon(icon);
          this.value = '';
        }
      }
    });
  }
  
  // Initialize color picker
  const colorPicker = document.getElementById('messageColor');
  const colorHex = document.getElementById('colorHex');
  const colorPreview = document.getElementById('colorPreview');
  
  if (colorPicker && colorHex && colorPreview) {
    colorPicker.addEventListener('input', function() {
      const color = this.value;
      colorHex.value = color;
      colorPreview.style.backgroundColor = color;
    });
    
    colorHex.addEventListener('input', function() {
      const color = this.value;
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        colorPicker.value = color;
        colorPreview.style.backgroundColor = color;
      }
    });
    
    colorPreview.addEventListener('click', function() {
      colorPicker.click();
    });
  }
  
  // Initialize image upload
  const imageInput = document.getElementById('images');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }
  
  console.log('Form handlers initialized successfully');
}

// Thêm kiểm tra tương thích trình duyệt
// Kiểm tra hỗ trợ các API hiện đại
function checkBrowserCompatibility() {
  if (!window.firebase) {
    console.error("Firebase không được tải! Vui lòng kiểm tra kết nối internet và thử lại.");
    return false;
  }
  return true;
}

// Initialize page - Chỉ một sự kiện DOMContentLoaded duy nhất
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - Bắt đầu khởi tạo ứng dụng");
  
  try {
    // Đảm bảo các biến cần thiết đã được khởi tạo
    if (typeof window.iconsArray === 'undefined') window.iconsArray = ["❤️", "💖", "💕"];
    if (typeof window.imagesArray === 'undefined') window.imagesArray = [];
    
    // Kiểm tra tương thích trước
    if (typeof checkBrowserCompatibility === 'function') {
      if (!checkBrowserCompatibility()) {
        console.warn("Trình duyệt không tương thích hoặc Firebase không tải được! Cố gắng tiếp tục...");
      }
    } else {
      console.warn("Hàm checkBrowserCompatibility không tồn tại");
    }
    
    // Khởi tạo Firebase nếu cần (với thêm retry logic)
    const initializeFirebase = function() {
      if (typeof window.initializeFirebaseMusicUploader === 'function') {
        window.initializeFirebaseMusicUploader().catch(err => {
          console.warn("Lỗi khởi tạo Firebase Music Uploader:", err);
        });
      } else {
        console.warn("initializeFirebaseMusicUploader không được định nghĩa, có thể Firebase chưa được tải đầy đủ");
        // Thử lại sau 1 giây
        setTimeout(initializeFirebase, 1000);
      }
    };
    
    // Đặt lịch khởi tạo Firebase sau
    setTimeout(initializeFirebase, 500);
    
    // Khởi tạo UI theo thứ tự logic và bảo vệ tốt hơn
    const initializationSteps = [
      { name: "createStars", message: "1. Đã tạo stars background" },
      { name: "updateIconsDisplay", message: "2. Đã khởi tạo icon display" },
      { name: "initializeFormHandlers", message: "3. Đã khởi tạo form handlers" },
      { name: "loadAvailableSongs", message: "4. Đã load bài hát có sẵn" },
      { name: "loadAutoSave", message: "5. Đã load dữ liệu tự động lưu" }
    ];
    
    // Thực hiện tuần tự từng bước
    initializationSteps.forEach(step => {
      try {
        if (typeof window[step.name] === 'function') {
          window[step.name]();
          console.log(step.message);
        } else {
          console.error(`Không tìm thấy hàm ${step.name}!`);
        }
      } catch (stepError) {
        console.error(`Lỗi khi thực hiện ${step.name}:`, stepError);
      }
    });
    
    // Đảm bảo form xử lý đúng khi nhấn nút tạo
    const galaxyForm = document.getElementById('galaxyForm');
    const createGalaxyBtn = document.getElementById('createGalaxyBtn');
    
    if (createGalaxyBtn) {
      createGalaxyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Xử lý tạo galaxy qua nút bấm...");
        
        if (typeof handleFormSubmit === 'function') {
          handleFormSubmit(e);
        } else {
          console.error("handleFormSubmit không được định nghĩa!");
          alert("Lỗi: Chức năng xử lý form chưa được tải đầy đủ. Hãy làm mới trang.");
        }
      });
      console.log("6. Đã gắn sự kiện cho nút tạo galaxy");
    }
    
    if (galaxyForm) {
      galaxyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Xử lý submit form galaxy...");
        
        if (typeof handleFormSubmit === 'function') {
          handleFormSubmit(e);
        } else {
          console.error("handleFormSubmit không được định nghĩa!");
          alert("Lỗi: Chức năng xử lý form chưa được tải đầy đủ. Hãy làm mới trang.");
        }
      });
      console.log("7. Đã gắn sự kiện submit form");
    }
    
    console.log("✅ Khởi tạo ứng dụng hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi trong quá trình khởi tạo ứng dụng:", err);
    alert("Có lỗi xảy ra khi khởi tạo ứng dụng. Vui lòng làm mới trang và thử lại.");
  }
});

// Function to load available songs
async function loadAvailableSongs() {
  console.log('Loading available songs...');
  
  // Đảm bảo biến toàn cục đã được khởi tạo
  if (typeof window.availableSongs === 'undefined') {
    window.availableSongs = {};
  }
  
  // Thử lấy danh sách bài hát từ API
  let loadedFromAPI = false;
  
  if (window.dearGiftAPI && window.dearGiftAPI.getAvailableSongs) {
    try {
      console.log('Trying to load songs from API...');
      const songs = await window.dearGiftAPI.getAvailableSongs();
      
      if (songs && Object.keys(songs).length > 0) {
        window.availableSongs = songs;
        loadedFromAPI = true;
        console.log('Loaded songs from API successfully:', Object.keys(songs));
      }
    } catch (error) {
      console.warn('Không thể tải danh sách bài hát từ API:', error.message);
    }
  }
  
  // Nếu không thể tải từ API, thử dùng biến cục bộ
  if (!loadedFromAPI) {
    // Kiểm tra xem availableSongs đã được định nghĩa cục bộ chưa
    if (typeof availableSongs !== 'undefined' && availableSongs) {
      // Make availableSongs global
      window.availableSongs = availableSongs;
      console.log('Loaded songs from local definition:', Object.keys(availableSongs));
    } else {
      console.warn('Biến availableSongs cục bộ chưa được định nghĩa, sử dụng mặc định');
      // Dùng danh sách bài hát mặc định
      window.availableSongs = window.availableSongs || {
        love: [
          { id: "love1", name: "Anh Là Của Em (Default)", url: "./songs/anh_la_cua_em.mp4" },
          { id: "love2", name: "Yêu Là Tha Thu (Default)", url: "./songs/yeu_la_tha_thu.mp4" },
        ],
        birthday: [
          { id: "birthday1", name: "Chúc Mừng Sinh Nhật (Default)", url: "./songs/chuc_mung_sinh_nhat.mp4" },
        ]
      };
    }
  }
  
  // Reset selected song
  window.selectedSong = null;
  
  // Attempt to fill the songCategory dropdown if it exists
  const songCategory = document.getElementById('musicCategory');
  if (songCategory) {
    console.log('Found music category selector');
    
    // Clear existing options except the first one
    while (songCategory.options.length > 1) {
      songCategory.remove(1);
    }
    
    // Add categories as options
    Object.keys(availableSongs).forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize
      songCategory.appendChild(option);
    });
    
    // Add event listener to populate songs when category changes
    songCategory.addEventListener('change', function() {
      const selectedCategory = this.value;
      populateSongsList(selectedCategory);
    });
    
    // Default to first category
    if (songCategory.options.length > 1) {
      songCategory.selectedIndex = 1;
      populateSongsList(songCategory.value);
    }
  } else {
    console.log('Music category selector not found');
    
    // Create songs list directly if no category selector
    const allSongs = [];
    Object.values(availableSongs).forEach(categoryList => {
      categoryList.forEach(song => allSongs.push(song));
    });
    
    createSongsList(allSongs);
  }
  
  console.log('Available songs loaded');
}

// Helper function to populate songs list based on category
function populateSongsList(category) {
  if (!category || !availableSongs[category]) return;
  createSongsList(availableSongs[category]);
}

// Create songs list in the DOM
function createSongsList(songs) {
  const songsList = document.getElementById('songsList');
  if (!songsList) return;
  
  songsList.innerHTML = ''; // Clear existing list
  
  songs.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.dataset.id = song.id;
    songItem.dataset.url = song.url;
    songItem.innerHTML = `
      <div class="song-name">${song.name}</div>
      <div class="song-actions">
        <button class="preview-btn" onclick="previewSong('${song.url}', '${song.name.replace(/'/g, "\\'")}')">▶️</button>
      </div>
    `;
    
    songItem.addEventListener('click', function() {
      // Remove selected class from all items
      document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Add selected class to this item
      this.classList.add('selected');
      
      // Set selected song
      window.selectedSong = song;
      console.log('Selected song:', song);
      
      // If uploadedMusicFile exists, clear it as we're using a preset song
      window.uploadedMusicFile = null;
    });
    
    songsList.appendChild(songItem);
  });
}

// Khai báo biến global ngay từ đầu để tránh undefined
// Định nghĩa biến toàn cục trước khi sử dụng
if (typeof window.uploadedMusicFile === 'undefined') window.uploadedMusicFile = null;
if (typeof window.selectedSong === 'undefined') window.selectedSong = null;
if (typeof window.audioEnabled === 'undefined') window.audioEnabled = true;
if (typeof window.availableSongs === 'undefined') window.availableSongs = null;

// Available songs data - chỉ sử dụng file thực tế đã tải
const availableSongs = {
  love: [
    { id: "love1", name: "Anh Là Của Em - Karik ft. Lou Hoàng (Cover)", url: "./songs/anh_la_cua_em.mp4" },
    { id: "love2", name: "Yêu Là Tha Thu - Onlyc ft. Karik (Cover)", url: "./songs/yeu_la_tha_thu.mp4" },
    { id: "love3", name: "Có Chàng Trai Viết Lên Cây - Phan Mạnh Quỳnh (Piano Cover)", url: "./songs/co_chang_trai_viet_len_cay.mp4" },
  ],
  birthday: [
    { id: "birthday1", name: "Chúc Mừng Sinh Nhật (Instrumental)", url: "./songs/chuc_mung_sinh_nhat.mp4" },
    // Thêm bài hát sinh nhật khác nếu cần
  ],
  trending: [
    { id: "trend1", name: "Anh Là Của Em (Popular Cover)", url: "./songs/anh_la_cua_em.mp4" },
    { id: "trend2", name: "Yêu Là Tha Thu (Trending)", url: "./songs/yeu_la_tha_thu.mp4" },
  ],
  instrumental: [
    { id: "inst1", name: "Piano Acoustic Cover", url: "./songs/co_chang_trai_viet_len_cay.mp4" },
  ]
};

// Global variables
let iconsArray = ["❤️", "💖", "💕"];
let imagesArray = [];

// Update icons display (định nghĩa sớm để có thể gọi từ mọi nơi)
function updateIconsDisplay() {
  try {
    const container = document.getElementById("iconsTags");
    if (!container) {
      console.warn("Không tìm thấy container iconsTags");
      return;
    }
    
    // Đảm bảo iconsArray được khởi tạo
    if (!window.iconsArray || !Array.isArray(window.iconsArray)) {
      window.iconsArray = ["❤️", "💖", "💕"];
      console.warn("iconsArray không tồn tại hoặc không phải là mảng, đã khởi tạo mảng mặc định");
    }
    
    container.innerHTML = "";

    window.iconsArray.forEach((icon, index) => {
      if (!icon) return; // Bỏ qua icon không hợp lệ
      
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.innerHTML = `
              ${icon}
              <span class="remove" onclick="removeIcon(${index})">×</span>
          `;
      container.appendChild(tag);
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hiển thị biểu tượng:", error);
  }
}

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
  try {
    const container = document.getElementById("previewImages");
    if (!container) {
      console.error("Không tìm thấy container previewImages!");
      return;
    }
    
    // Make sure imagesArray exists
    if (!window.imagesArray || !Array.isArray(window.imagesArray)) {
      window.imagesArray = [];
      console.warn("imagesArray không tồn tại hoặc không phải là mảng, đã khởi tạo mảng rỗng");
    }
    
    container.innerHTML = "";

    window.imagesArray.forEach((image, index) => {
      // Kiểm tra hình ảnh hợp lệ
      if (!image || !image.url) {
        console.warn(`Bỏ qua hình ảnh không hợp lệ tại vị trí ${index}`, image);
        return;
      }
      
      const div = document.createElement("div");
      div.className = "preview-image";
      div.innerHTML = `
              <img src="${image.url}" alt="${image.name || 'Image ' + (index + 1)}">
              <button class="remove" onclick="removeImage(${index})">×</button>
          `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hiển thị hình ảnh:", error);
  }
}

// Generate unique ID
function generateGalaxyId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return timestamp + randomStr;
}

// Handle form submission
async function handleFormSubmit(e) {
  // Đảm bảo ngăn chặn reload trang
  if (e) e.preventDefault();
  
  console.log("Bắt đầu xử lý tạo galaxy...");
  
  const loading = document.getElementById("loading");
  const resultContainer = document.getElementById("resultContainer");
  const submitBtn = document.getElementById("createGalaxyBtn");

    // Show loading and disable submit
  if (loading) loading.style.display = "block";
  if (resultContainer) resultContainer.style.display = "none";
  if (submitBtn) {
    submitBtn.disabled = true;
    console.log("Đã vô hiệu hóa nút tạo galaxy");
  }  try {
    console.log("=== STARTING GALAXY CREATION PROCESS ===");
    
    // Get form data (now async to handle music file conversion)
    const formData = await getFormData();
    console.log("Form data collected successfully");

    // Validate form data
    if (!validateFormData(formData)) {
      console.error("Form validation failed");
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
    }
    console.log("Form validation passed");

    // Generate galaxy ID
    const galaxyId = generateGalaxyId();
    console.log("Generated galaxy ID:", galaxyId);

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
    // Luôn sử dụng URL production để tạo link chia sẻ
    const productionBaseUrl = "https://deargift.netlify.app/";

    // Tạo link với định dạng chuẩn và đảm bảo dùng HTTPS
    const galaxyLink = `${productionBaseUrl}index.html?id=${galaxyId}`;
    const shareLink = galaxyLink; // Link chia sẻ giống link xem

    // Kiểm tra tính hợp lệ của link
    console.log("Generated galaxy ID:", galaxyId);
    console.log("Production base URL:", productionBaseUrl);
    console.log("Final galaxy link:", galaxyLink);
    
    // Thực hiện kiểm tra tính hợp lệ của URL
    try {
      // Kiểm tra URL hợp lệ
      new URL(galaxyLink);
      
      // Kiểm tra URL có chứa ID
      if (!galaxyLink.includes(`id=${galaxyId}`)) {
        console.warn("⚠️ CẢNH BÁO: Link không chứa ID galaxy đúng!");
        showToast("⚠️ Link có thể không hoạt động do thiếu ID!", "warning");
      }
      
      // Kiểm tra URL có sử dụng giao thức HTTPS không
      if (!galaxyLink.startsWith('https://')) {
        console.warn("⚠️ CẢNH BÁO: Link không sử dụng HTTPS!");
        showToast("⚠️ Link nên sử dụng HTTPS để hoạt động tốt nhất!", "warning");
      }
    } catch (error) {
      console.error("❌ LỖI: URL không hợp lệ:", error);
      showToast("❌ Link không hợp lệ, có thể không hoạt động khi chia sẻ!", "error");
    }

    // Kiểm tra lại link đã tạo
    console.log("Final galaxy link for display:", galaxyLink);
    console.log("Final share link for display:", shareLink);
    
    // Show result
    showResult(galaxyLink, shareLink, galaxyId);
    
    // Hiển thị thông báo thành công
    showToast("✅ Galaxy đã được tạo thành công!", "success");
  } catch (error) {
    console.error("ERROR DURING GALAXY CREATION:", error);
    alert("Có lỗi xảy ra: " + error.message);
    if (error && error.stack) {
      console.error("Chi tiết lỗi:", error.stack);
    } else {
      console.error("Chi tiết lỗi:", error);
    }
    showToast("❌ Tạo Galaxy thất bại: " + error.message, "error");
  } finally {
    if (loading) loading.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = false;
      console.log("Đã kích hoạt lại nút tạo galaxy");
    }
  }
}

// Get form data
async function getFormData() {
  console.log("Collecting form data...");
  
  const messagesEl = document.getElementById("messages");
  if (!messagesEl) {
    console.error("Messages element not found");
    throw new Error("Không tìm thấy ô nhập tin nhắn");
  }
  
  const messages = messagesEl.value.split("\n")
    .filter((msg) => msg.trim())
    .map((msg) => msg.trim());

  const color = document.getElementById("messageColor")?.value || "#ff6b9d";
  const heartText = document.getElementById("heartText")?.value.trim() || "";
  const enableHeart = document.getElementById("enableHeart")?.checked ?? true;
  const hideFooter = document.getElementById("hideFooter")?.checked ?? false;

  // Kiểm tra và chuyển đổi URL nhạc thành URL public
async function convertToPublicMusicUrl(url, originalFile = null) {
  // Nếu URL là null hoặc undefined
  if (!url) return null;
  
  console.log('Kiểm tra và chuyển đổi URL nhạc:', url);
  
  // Đã là URL public (http/https không phải blob và không phải tương đối)
  if ((url.startsWith('http://') || url.startsWith('https://')) && 
      !url.startsWith('blob:') && 
      !url.includes('localhost') &&
      !url.includes('127.0.0.1')) {
    console.log('URL đã là public, không cần chuyển đổi:', url);
    return url;
  }
  
  // Nếu là URL blob, cố gắng chuyển đổi qua API hoặc file.io
  if (url.startsWith('blob:')) {
    console.warn('Phát hiện Blob URL, không thể chia sẻ được:', url);
    
    // Kiểm tra xem có API backend không
    if (window.dearGiftAPI && window.dearGiftAPI.uploadMusic && originalFile) {
      try {
        console.log('Đang upload lại file nhạc qua API để đảm bảo chia sẻ được...');
        const newUpload = await window.dearGiftAPI.uploadMusic(originalFile);
        if (newUpload && newUpload.url) {
          console.log('Đã chuyển đổi thành công từ Blob URL sang API URL:', newUpload.url);
          return newUpload.url;
        }
      } catch (error) {
        console.error('Lỗi khi chuyển đổi URL qua API:', error);
      }
    }
    
    // Thử upload qua file.io nếu có originalFile
    if (originalFile) {
      try {
        console.log('Thử upload qua file.io...');
        const formData = new FormData();
        formData.append('file', originalFile);
        
        const response = await fetch('https://file.io/', {
          method: 'POST',
          body: formData,
          mode: 'cors'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.link) {
            console.log('Upload qua file.io thành công:', result.link);
            return result.link;
          }
        }
      } catch (error) {
        console.error('Lỗi khi upload qua file.io:', error);
      }
    }
    
    // Nếu không thể chuyển đổi, hiển thị cảnh báo và trả về URL gốc
    alert("CẢNH BÁO: File nhạc dùng Blob URL và sẽ KHÔNG PHÁT ĐƯỢC khi chia sẻ. Hãy thử lại với nhạc có sẵn hoặc nhập URL nhạc trực tiếp.");
    return url; // Trả về URL gốc dù biết không chia sẻ được
  }
  
  // Nếu là URL tương đối, chuyển đổi thành tuyệt đối
  if (url.startsWith('./') || url.startsWith('../')) {
    try {
      // URL gốc của trang web hiện tại
      const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
      const absoluteUrl = new URL(url.startsWith('./') ? url.substring(2) : url, baseUrl).href;
      console.log('Đã chuyển đổi URL tương đối thành tuyệt đối:', absoluteUrl);
      
      // Kiểm tra xem URL tuyệt đối có phải localhost không
      if (absoluteUrl.includes('localhost') || absoluteUrl.includes('127.0.0.1')) {
        console.warn('URL tuyệt đối vẫn là localhost, có thể không chia sẻ được:', absoluteUrl);
        
        // Tạo URL với domain của production nếu biết
        try {
          // Nếu đang ở localhost, thử thay thế bằng URL production
          const productionDomain = 'https://deargift.netlify.app';
          const productionPath = absoluteUrl.split('/').slice(3).join('/');
          const productionUrl = `${productionDomain}/${productionPath}`;
          console.log('Đã tạo URL production:', productionUrl);
          return productionUrl;
        } catch (error) {
          console.error('Lỗi khi tạo URL production:', error);
          return absoluteUrl;
        }
      }
      
      return absoluteUrl;
    } catch (error) {
      console.error('Lỗi khi chuyển đổi URL tương đối:', error);
      return url;
    }
  }
  
  // Trường hợp khác, trả về URL gốc
  return url;
}

// Luôn chỉ lấy link nhạc (URL), không lưu base64 vào Firestore
  let musicData = null;
  
  // Đảm bảo biến global tồn tại
  if (typeof window.uploadedMusicFile === 'undefined') window.uploadedMusicFile = null;
  if (typeof window.selectedSong === 'undefined') window.selectedSong = null;
  window.audioEnabled = true; // Đảm bảo âm thanh được bật mặc định
  
  console.log("Checking music sources...");
  console.log("- uploadedMusicFile:", window.uploadedMusicFile);
  console.log("- selectedSong:", window.selectedSong);
  
  try {
    // Ưu tiên: uploader custom (Backend API) -> preset -> nhập tay -> default
    if (window.uploadedMusicFile && window.uploadedMusicFile.url) {
      // Chuyển đổi URL thành public URL
      musicData = await convertToPublicMusicUrl(
        window.uploadedMusicFile.url, 
        window.uploadedMusicFile.originalFile
      );
      console.log('Using uploaded music file (converted):', musicData);
      
    } else if (window.selectedSong) {
      // Chuyển đổi URL bài hát có sẵn
      musicData = await convertToPublicMusicUrl(window.selectedSong.url);
      console.log('Using preset song (converted):', musicData);
      
    } else {
      // Cho phép nhập link nhạc thủ công nếu không upload được
      const manualMusicUrl = document.getElementById('manualMusicUrl');
      if (manualMusicUrl && manualMusicUrl.value && manualMusicUrl.value.trim()) {
        musicData = manualMusicUrl.value.trim();
        console.log('Using manual music URL:', musicData);
      } else {
        // Sử dụng bài hát mặc định từ availableSongs nếu có
        try {
          const defaultSong = availableSongs?.love?.[0] || availableSongs?.birthday?.[0];
          if (defaultSong) {
            musicData = await convertToPublicMusicUrl(defaultSong.url);
            console.log('Using default song as fallback (converted):', musicData);
          } else {
            console.log('No music selected and no default available');
            musicData = null;
          }
        } catch (e) {
          console.error('Error selecting default song:', e);
          musicData = null;
        }
      }
    }
    
    // Kiểm tra lại nếu vẫn là blob URL
    if (musicData && musicData.startsWith('blob:')) {
      console.warn('⚠️ CẢNH BÁO: Nhạc vẫn sử dụng Blob URL và sẽ không phát được khi chia sẻ:', musicData);
      
      // Hiển thị cảnh báo cho người dùng
      const warningMsg = "⚠️ Cảnh báo: File nhạc đã chọn sẽ KHÔNG PHÁT ĐƯỢC khi bạn chia sẻ với người khác. Hãy thử lại với nhạc có sẵn hoặc nhập URL nhạc trực tiếp.";
      showToast(warningMsg, "warning", 10000); // Hiển thị lâu hơn 10s
      
      // Nếu không chấp nhận blob URL, có thể set musicData = null ở đây
      // musicData = null;
    }
    
    // Kiểm tra URL localhost
    if (musicData && (musicData.includes('localhost') || musicData.includes('127.0.0.1'))) {
      console.warn('⚠️ CẢNH BÁO: Nhạc sử dụng URL localhost và sẽ không phát được khi chia sẻ:', musicData);
      showToast("⚠️ Cảnh báo: URL nhạc chứa localhost và sẽ không phát được khi chia sẻ!", "warning", 8000);
    }
  } catch (error) {
    console.error("Lỗi khi xử lý URL nhạc:", error);
    showToast("⚠️ Có lỗi khi xử lý URL nhạc, hãy thử lại!", "error");
    musicData = null;
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
  console.log("Validating form data:", data);
  
  try {
    if (!data.messages || data.messages.length === 0) {
      console.error("No messages provided");
      alert("Vui lòng nhập ít nhất một tin nhắn");
      return false;
    }

    if (!data.icons || data.icons.length === 0) {
      console.error("No icons provided");
      // Thêm biểu tượng mặc định thay vì báo lỗi
      data.icons = ["❤️", "💖", "💕"];
      showToast("⚠️ Đã tự động thêm biểu tượng mặc định", "warning");
    }

    // Kiểm tra thêm màu sắc
    if (!data.color) {
      data.color = "#ff6b9d"; // Màu mặc định
    }
    
    console.log("Form data valid:", data);
    return true;
  } catch (error) {
    console.error("Error validating form:", error);
    alert("Có lỗi xảy ra khi kiểm tra form: " + error.message);
    return false;
  }
}

// Smart Music Upload Handler với Blob URL ưu tiên
async function handleSmartMusicUpload(file, progressCallback) {
  console.log('Starting smart music upload for file:', file.name);
  
  // Validate file
  if (!file || !file.type.startsWith('audio/')) {
    throw new Error('File không phải là file âm thanh hợp lệ');
  }
  
  if (file.size > 100 * 1024 * 1024) { // 100MB limit
    throw new Error('File âm thanh vượt quá 100MB!');
  }
  
  try {
    // Phương pháp 1: Blob URL (ưu tiên vì luôn hoạt động)
    if (progressCallback) progressCallback(20);
    
    console.log('Creating Blob URL for music (primary method)');
    const blobUrl = URL.createObjectURL(file);
    
    if (progressCallback) progressCallback(60);
    
    // Thử file.io song song (không chặn)
    let fileioUrl = null;
    try {
      if (progressCallback) progressCallback(80);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch('https://file.io/', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.link) {
          fileioUrl = result.link;
          console.log('file.io upload also successful:', fileioUrl);
        }
      }
    } catch (fileioError) {
      console.warn('file.io upload failed (background):', fileioError.message);
    }
    
    if (progressCallback) progressCallback(100);
    
    return {
      url: fileioUrl || blobUrl, // Ưu tiên file.io nếu có, không thì dùng blob
      blobUrl: blobUrl, // Luôn có blob backup
      fileioUrl: fileioUrl, // file.io nếu thành công
      originalName: file.name,
      fileName: `smart_${Date.now()}_${file.name}`,
      size: file.size,
      type: file.type,
      isBlobUpload: !fileioUrl, // true nếu chỉ có blob
      isFileioUpload: !!fileioUrl, // true nếu có file.io
      uploadedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Smart upload failed:', error);
    throw new Error(`Upload thất bại: ${error.message}`);
  }
}

// Enhanced music upload handler
window.handleEnhancedMusicUpload = async function(e) {
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
    let uploadResult = null;
    
    // Thử sử dụng API mới trước
    if (window.dearGiftAPI && window.uploadMusicWithAPI) {
      uploadStatus.innerHTML = '📤 Đang upload qua API...';
      try {
        uploadResult = await window.uploadMusicWithAPI(file);
        console.log('Upload qua API thành công:', uploadResult);
      } catch (apiError) {
        console.warn('Upload qua API thất bại, fallback to local methods:', apiError);
      }
    }
    
    // Fallback to old method if API upload failed
    if (!uploadResult) {
      uploadStatus.innerHTML = '📤 API không khả dụng, thử phương pháp khác...';
      const url = await uploadMusicAndGetUrl(file, uploadStatus);
      if (!url) throw new Error('Không lấy được link nhạc!');
      
      uploadResult = {
        url: url,
        originalName: file.name,
        size: file.size,
        type: file.type,
        isSmartUpload: true,
        uploadedAt: new Date().toISOString()
      };
    }
    
    // Set global uploaded file
    uploadedMusicFile = uploadResult;
    
    // Clear preset selection khi upload custom
    selectedSong = null;
    const allSongItems = document.querySelectorAll('.song-item');
    allSongItems.forEach(item => item.classList.remove('selected'));
    
    // Hiển thị thông tin upload
    let uploadMethod = 'Blob URL';
    const url = uploadResult.url;
    
    if (url.includes('/api/') || url.includes(':3000/')) {
      uploadMethod = 'Backend API (Server)';
    } else if (url.startsWith('https://file.io/')) {
      uploadMethod = 'file.io (Public)';
    } else if (url.startsWith('data:')) {
      uploadMethod = 'Base64 (Embedded)';
    } else if (url.startsWith('blob:')) {
      uploadMethod = 'Blob URL (Local)';
    }
    
    uploadStatus.innerHTML = `✅ Upload thành công: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)<br>🔄 Phương pháp: ${uploadMethod}<br>🔗 Sẵn sàng tạo galaxy!`;
    uploadStatus.style.color = '#4CAF50';
    
    setTimeout(() => {
      if (uploadedMusicFile.url && typeof window.previewMusic === 'function') {
        window.previewMusic(uploadedMusicFile.url, uploadedMusicFile.originalName);
      }
    }, 500);
  } catch (error) {
    console.error('Enhanced music upload error:', error);
    uploadStatus.innerHTML = `❌ Upload thất bại: ${error.message}`;
    uploadStatus.style.color = '#f44336';
    uploadedMusicFile = null;
    showToast(`❌ Upload nhạc thất bại: ${error.message}. Thử file nhỏ hơn hoặc chọn nhạc có sẵn.`, 'error');
  }
// Hàm upload nhạc với fallback thông minh (Blob URL là chính)
async function uploadMusicAndGetUrl(file, statusEl, uploadEndpoint) {
  if (!file || !file.type.startsWith('audio/')) {
    alert('Vui lòng chọn file nhạc hợp lệ!');
    return null;
  }
  
  try {
    // Nếu có uploadEndpoint (proxy backend), upload qua đó
    if (uploadEndpoint) {
      if (statusEl) {
        statusEl.innerHTML = '📤 Đang upload qua proxy backend...';
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.link) {
            if (statusEl) {
              statusEl.innerHTML = `✅ Upload proxy thành công: ${result.link}`;
            }
            console.log('Proxy upload successful:', result.link);
            return result.link;
          }
        }
      } catch (proxyError) {
        console.warn('Proxy upload failed:', proxyError.message);
      }
    } else {
      // Phương pháp 1: Thử file.io trước (nếu có thể)
      if (statusEl) {
        statusEl.innerHTML = '📤 Đang thử upload lên file.io...';
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        const response = await fetch('https://file.io/', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          mode: 'cors'
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.link) {
            if (statusEl) {
              statusEl.innerHTML = `✅ Upload file.io thành công: ${result.link}`;
            }
            console.log('file.io upload successful:', result.link);
            return result.link;
          }
        }
      } catch (fileioError) {
        console.warn('file.io upload failed:', fileioError.message);
      }
    }
    
    // Phương pháp 2: Blob URL (chính, luôn hoạt động)
    if (statusEl) {
      statusEl.innerHTML = '🔄 file.io không khả dụng, sử dụng Blob URL...';
    }
    
    const blobUrl = URL.createObjectURL(file);
    
    if (statusEl) {
      statusEl.innerHTML = `✅ Sử dụng Blob URL thành công: ${file.name}`;
    }
    
    console.log('Blob URL created:', blobUrl);
    return blobUrl;
    
  } catch (err) {
    console.error('All upload methods failed:', err);
    
    // Phương pháp 3: Base64 cho file nhỏ
    if (file.size <= 5 * 1024 * 1024) {
      try {
        if (statusEl) {
          statusEl.innerHTML = '🔄 Thử Base64 encoding...';
        }
        
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        if (statusEl) {
          statusEl.innerHTML = `✅ Sử dụng Base64: ${file.name}`;
        }
        
        return base64Data;
      } catch (base64Error) {
        console.error('Base64 encoding failed:', base64Error);
      }
    }
    
    alert(`Upload thất bại: ${err.message}\nHãy thử file nhỏ hơn hoặc chọn nhạc có sẵn.`);
    return null;
  }
}
}

// Kiểm tra xem URL có chứa localhost hay không
function isLocalOrDevUrl(url) {
  if (!url) return false;
  return url.includes('localhost') || 
         url.includes('127.0.0.1') || 
         url.includes('file://') || 
         url.startsWith('blob:');
}

// Tạo URL public từ URL tương đối hoặc local
function createPublicUrl(path) {
  // Nếu đã là URL đầy đủ và không phải localhost, trả về nguyên gốc
  if (path.startsWith('http') && !isLocalOrDevUrl(path)) {
    return path;
  }
  
  // Tạo URL sản phẩm từ các URL tương đối
  const productionDomain = 'https://deargift.netlify.app';
  
  // Nếu là path tương đối, loại bỏ ./ nếu có
  if (path.startsWith('./')) {
    path = path.substring(2);
  }
  
  // Đảm bảo không có dấu / kép
  return `${productionDomain}/${path}`.replace(/([^:])\/\/+/g, '$1/');
}

// Save galaxy data
async function saveGalaxyData(id, data) {
  console.log("Saving galaxy data for ID:", id);
  
  // Kiểm tra URL nhạc và tạo bản public nếu cần
  if (data.song) {
    if (isLocalOrDevUrl(data.song)) {
      console.warn("Phát hiện URL nhạc chứa localhost/blob, cần xử lý:", data.song);
      
      // Thử lưu cả URL gốc và URL tạo sẵn để đảm bảo tương thích
      data._originalSongUrl = data.song;
      
      // Nếu là URL nhạc từ songs/ folder
      if (data.song.includes('/songs/')) {
        try {
          // Lấy phần path sau songs/
          const matches = data.song.match(/\/songs\/(.+)$/);
          if (matches && matches[1]) {
            const songPath = 'songs/' + matches[1];
            const publicUrl = createPublicUrl(songPath);
            console.log("Đã tạo URL nhạc public:", publicUrl);
            data.song = publicUrl;
          }
        } catch (error) {
          console.error("Lỗi khi tạo URL nhạc public:", error);
        }
      }
    }
  }

  // Save to localStorage as backup (always save full data locally)
  const existingData = JSON.parse(
    localStorage.getItem("deargift_galaxies") || "{}"
  );
  existingData[id] = data;
  localStorage.setItem("deargift_galaxies", JSON.stringify(existingData));
  console.log("Galaxy saved to localStorage successfully");

  // Debug log
  console.log("Galaxy saved to localStorage with ID:", id);
  console.log("Galaxy data:", data);

  // Prepare data for backend API (check size limits)
  let apiData = { ...data };
  
  // Check if song data is too large
  if (apiData.song) {
    // Ước tính kích thước dữ liệu
    const songDataSize = typeof apiData.song === 'string' ? 
      new Blob([apiData.song]).size : 0;
    const maxApiSize = 10 * 1024 * 1024; // 10MB limit
    
    if (songDataSize > maxApiSize) {
      console.warn(`Song data too large for API (${(songDataSize / 1024).toFixed(1)}KB), saving without music`);
      // Create a version without music for API
      apiData = { ...data, song: null, hasLargeMusic: true };
      showToast(`⚠️ Nhạc quá lớn cho server, chỉ lưu tạm local. Galaxy vẫn hoạt động bình thường!`, 'warning');
    }
  }

  // Lưu lên server API
  let savedToServer = false;
  
  if (window.dearGiftAPI && window.dearGiftAPI.saveGalaxy) {
    try {
      console.log('Trying to save galaxy using API...');
      const result = await window.dearGiftAPI.saveGalaxy(id, apiData);
      
      if (result && result.success) {
        savedToServer = true;
        console.log("✅ Galaxy saved to API server successfully:", id);
        
        // Show success message
        if (apiData.hasLargeMusic) {
          showToast("✅ Galaxy đã tạo thành công! (Nhạc lưu tạm local do kích thước lớn)");
        } else {
          showToast("✅ Galaxy đã được lưu lên server thành công!");
        }
      }
    } catch (error) {
      console.error("Error saving to API server:", error);
      
      // Provide specific error messages
      let errorMessage = "Lưu lên server thất bại. ";
      
      if (error.message.includes('already exists')) {
        errorMessage += "ID đã tồn tại. ";
      } else if (error.message.includes('timeout')) {
        errorMessage += "Server phản hồi quá chậm. ";
      } else if (error.message.includes('size')) {
        errorMessage += "Dữ liệu quá lớn cho server. ";
      } else if (error.message.includes('network') || error.message.includes('connect')) {
        errorMessage += "Lỗi kết nối mạng. ";
      } else {
        errorMessage += `Lỗi: ${error.message}. `;
      }
      
      errorMessage += "Galaxy đã được lưu tạm trên máy bạn và vẫn có thể sử dụng.";
      
      // Show user-friendly error message
      showToast(`⚠️ ${errorMessage}`, 'warning');
      
      // Log detailed error for debugging
      console.error("Detailed API error:", {
        message: error.message,
        stack: error.stack
      });
    }
  } else {
    console.warn('API client không khả dụng, chỉ lưu vào localStorage');
    showToast("ℹ️ Server không khả dụng. Galaxy đã được lưu tạm trên máy bạn.", "info");
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

// Kiểm tra URL có hoạt động không
async function verifyUrl(url) {
  try {
    // Nếu là blob URL, không thể verify
    if (url.startsWith('blob:')) {
      console.warn('Blob URL không thể kiểm tra từ xa:', url);
      return {
        valid: false,
        warning: "Link sử dụng blob URL và chỉ hoạt động trên thiết bị này!"
      };
    }
    
    // Kiểm tra URL có đúng định dạng không
    new URL(url);
    
    // Kiểm tra URL có phải là đường dẫn tương đối không
    if (url.startsWith('./') || url.startsWith('../')) {
      console.warn('URL tương đối không thể truy cập từ xa:', url);
      return {
        valid: false,
        warning: "Link sử dụng đường dẫn tương đối và có thể không hoạt động khi chia sẻ!"
      };
    }
    
    // Kiểm tra URL có chứa thông tin ID không
    if (!url.includes('id=')) {
      console.warn('URL không chứa tham số ID:', url);
      return {
        valid: false,
        warning: "Link không chứa ID galaxy, có thể không hoạt động khi chia sẻ!"
      };
    }
    
    return {
      valid: true
    };
  } catch (error) {
    console.error('URL không hợp lệ:', error);
    return {
      valid: false,
      warning: "Link không hợp lệ!"
    };
  }
}

// Show result
async function showResult(galaxyLink, shareLink, galaxyId) {
  console.log("=== DEBUG showResult ===");
  console.log("galaxyLink:", galaxyLink);
  console.log("shareLink:", shareLink);
  console.log("galaxyId:", galaxyId);
  
  if (!galaxyLink || !galaxyId) {
    console.error("Missing required parameters for showResult");
    alert("Lỗi hiển thị kết quả: Thiếu thông tin link hoặc ID");
    return;
  }

  const resultContainer = document.getElementById("resultContainer");
  const galaxyLinkInput = document.getElementById("galaxyLink");
  const qrCodeContainer = document.getElementById("qrCode");
  
  // Tạo thẻ div cho cảnh báo nếu cần
  let warningBox = document.getElementById('linkWarning');
  if (!warningBox) {
    warningBox = document.createElement('div');
    warningBox.id = 'linkWarning';
    warningBox.style.cssText = `
      margin: 10px 0;
      padding: 10px;
      background-color: rgba(255, 190, 0, 0.2);
      border-left: 4px solid #ffbe00;
      color: #ffbe00;
      border-radius: 4px;
      font-size: 14px;
      display: none;
    `;
    if (galaxyLinkInput && galaxyLinkInput.parentNode) {
      galaxyLinkInput.parentNode.appendChild(warningBox);
    }
  }

  console.log("resultContainer:", resultContainer);
  console.log("galaxyLinkInput:", galaxyLinkInput);
  console.log("qrCodeContainer:", qrCodeContainer);

  // Kiểm tra và set galaxy link trước
  if (galaxyLinkInput && galaxyLink) {
    galaxyLinkInput.value = galaxyLink;
    console.log("Galaxy link set to input:", galaxyLinkInput.value);
    
    // Thêm sự kiện cho nút sao chép link
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
      copyLinkBtn.onclick = function() {
        // Thêm script hỗ trợ copy nếu chưa có
        if (!window.copyToClipboard) {
          const scriptExists = document.querySelector('script[src*="clipboard-helper.js"]');
          if (!scriptExists) {
            const script = document.createElement('script');
            script.src = './clipboard-helper.js';
            document.head.appendChild(script);
            
            script.onload = function() {
              if (typeof window.copyToClipboard === 'function') {
                window.copyToClipboard(galaxyLink, 
                  () => showToast("✅ Đã sao chép link galaxy vào clipboard!", "success"),
                  (err) => showToast("❌ Không thể sao chép: " + err.message, "error")
                );
              } else {
                fallbackCopy();
              }
            };
          }
        } else {
          window.copyToClipboard(galaxyLink, 
            () => showToast("✅ Đã sao chép link galaxy vào clipboard!", "success"),
            (err) => showToast("❌ Không thể sao chép: " + err.message, "error")
          );
        }
        
        // Phương pháp copy cũ nếu không load được script
        function fallbackCopy() {
          try {
            navigator.clipboard.writeText(galaxyLink);
            showToast("✅ Đã sao chép link vào clipboard!");
          } catch (err) {
            const tempInput = document.createElement("input");
            tempInput.value = galaxyLink;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            showToast("✅ Đã sao chép link vào clipboard (phương pháp cũ)!");
          }
        }
      };
    }
    
    // Kiểm tra URL
    const urlCheck = await verifyUrl(galaxyLink);
    if (!urlCheck.valid && warningBox) {
      warningBox.textContent = "⚠️ " + urlCheck.warning;
      warningBox.style.display = 'block';
      
      // Thêm nút kiểm tra URL
      const checkUrlBtn = document.createElement('button');
      checkUrlBtn.textContent = "✓ Kiểm tra URL";
      checkUrlBtn.style.cssText = `
        background: #ffbe00;
        color: black;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        margin-top: 5px;
        cursor: pointer;
        font-size: 12px;
      `;
      warningBox.appendChild(checkUrlBtn);
      
      checkUrlBtn.onclick = async function() {
        checkUrlBtn.disabled = true;
        checkUrlBtn.textContent = "⏳ Đang kiểm tra...";
        
        try {
          // Thử ping URL để kiểm tra
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
          
          const response = await fetch(galaxyLink, { 
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors' 
          });
          
          clearTimeout(timeoutId);
          
          // Nếu không có lỗi, có thể URL hoạt động
          warningBox.innerHTML = "✅ URL có vẻ hoạt động, nhưng vẫn nên kiểm tra lại!";
          warningBox.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
          warningBox.style.borderLeft = "4px solid #4CAF50";
        } catch (error) {
          // Nếu có lỗi, URL có thể không hoạt động
          console.error("Lỗi kiểm tra URL:", error);
          warningBox.innerHTML = "❌ URL có thể không hoạt động! Hãy thử chia sẻ link khác.";
          warningBox.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
          warningBox.style.borderLeft = "4px solid #f44336";
        }
      };
    } else if (warningBox) {
      warningBox.style.display = 'none';
    }
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
    if (resultContainer) {
      console.log("Scrolling to result container");
      resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, 200);
  
  // Thêm debug log để xác nhận hoàn thành
  console.log("=== showResult completed successfully ===");
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
  
  if (!linkInput || !linkInput.value) {
    showToast("❌ Không có link để sao chép", "error");
    return;
  }
  
  const url = linkInput.value;
  
  try {
    // Kiểm tra URL trước khi sao chép
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('file:') || url.startsWith('blob:')) {
      showToast("⚠️ CẢNH BÁO: Link này có thể không hoạt động khi chia sẻ vì chứa URL local!", "warning", 8000);
    }
    
    // Kiểm tra URL có hợp lệ không
    new URL(url); // Throws error if invalid
    
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    // Sử dụng navigator.clipboard API nếu có
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("✅ Đã sao chép link Galaxy vào clipboard!");
      }).catch(err => {
        console.error("Clipboard write failed:", err);
        // Fallback to old method
        const successful = document.execCommand('copy');
        if (successful) {
          showToast("✅ Đã sao chép link Galaxy (phương pháp cũ)!");
        } else {
          throw new Error("Lệnh execCommand thất bại");
        }
      });
    } else {
      // Fallback for older browsers
      const successful = document.execCommand('copy');
      if (successful) {
        showToast("✅ Đã sao chép link Galaxy!");
      } else {
        throw new Error("Lệnh execCommand không được hỗ trợ");
      }
    }
  } catch (error) {
    console.error("Copy link error:", error);
    showToast("❌ Không thể sao chép link: " + error.message, "error");
  }
}

// Preview galaxy
function previewGalaxy() {
  const link = document.getElementById("galaxyLink").value;
  console.log("Opening galaxy preview:", link);
  if (link && link.trim()) {
    window.open(link, "_blank");
  } else {
    console.error("No valid galaxy link to preview");
    showToast("❌ Link không hợp lệ để xem trước", "error");
  }
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
function showToast(message, type = 'success') {
  // Create toast element
  const toast = document.createElement("div");
  
  // Set colors based on type
  let backgroundColor = '#4ecdc4'; // default success color
  if (type === 'warning') {
    backgroundColor = '#ff9800';
  } else if (type === 'error') {
    backgroundColor = '#f44336';
  }
  
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remove after longer time for warnings/errors
  const duration = type === 'warning' || type === 'error' ? 5000 : 3000;
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// This function will be called in the main DOMContentLoaded event

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
  console.log('Đang tải dữ liệu tự động lưu...');
  const draft = localStorage.getItem("deargift_draft");
  if (draft) {
    try {
      const data = JSON.parse(draft);
      console.log('Đã tìm thấy dữ liệu tự động lưu:', Object.keys(data));

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

      // Khôi phục icons an toàn hơn
      if (data.icons && Array.isArray(data.icons)) {
        window.iconsArray = data.icons;
        updateIconsDisplay();
      }
    } catch (error) {
      console.warn("Error loading auto-save:", error);
    }
  }
}

// Function to preview a song
function previewSong(url, name) {
  if (!url) return;
  
  console.log('Previewing song:', name, url);
  
  // Stop any existing audio
  if (window.previewAudio) {
    window.previewAudio.pause();
    window.previewAudio = null;
  }
  
  // Create new audio element
  const audio = new Audio(url);
  window.previewAudio = audio;
  
  // Show toast notification
  showToast(`🎵 Đang phát: ${name}`);
  
  // Play the audio
  audio.play().catch(err => {
    console.error('Error playing audio:', err);
    showToast('❌ Không thể phát nhạc. Hãy thử nhấp vào trang trước.', 'error');
  });
}

// Make previewSong globally available
window.previewSong = previewSong;

// Function to preview selected music
window.previewMusic = function(url, name) {
  previewSong(url, name || 'Uploaded Music');
};

// Auto-save every 30 seconds
setInterval(autoSave, 30000);

// loadAutoSave will be called in the main DOMContentLoaded event
