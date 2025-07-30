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
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

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

  // Handle drag and drop for images
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
    // Get form data
    const formData = getFormData();

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
function getFormData() {
  const messages = document
    .getElementById("messages")
    .value.split("\n")
    .filter((msg) => msg.trim())
    .map((msg) => msg.trim());

  const color = document.getElementById("messageColor").value;
  const heartText = document.getElementById("heartText").value.trim();
  const enableHeart = document.getElementById("enableHeart").checked;
  const hideFooter = document.getElementById("hideFooter").checked;

  // Handle music file
  const musicFile = document.getElementById("backgroundMusic").files[0];
  let musicData = null;
  if (musicFile) {
    // In production, upload to server and get URL
    musicData = musicFile.name; // For now, just store filename
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
