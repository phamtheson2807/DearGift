// Initialize stars background
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = window.innerWidth < 768 ? 100 : 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    initializeFormHandlers();
});

// Form handlers
function initializeFormHandlers() {
    const form = document.getElementById('galaxyForm');
    const iconsInput = document.getElementById('iconsInput');
    const colorPicker = document.getElementById('messageColor');
    const colorPreview = document.getElementById('colorPreview');
    const colorHex = document.getElementById('colorHex');
    const imagesInput = document.getElementById('images');
    
    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Handle icons input
    iconsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addIcon(this.value.trim());
            this.value = '';
        }
    });
    
    // Handle color picker
    colorPicker.addEventListener('change', function() {
        const color = this.value;
        colorPreview.style.backgroundColor = color;
        colorHex.value = color;
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
    
    // Handle image upload
    imagesInput.addEventListener('change', handleImageUpload);
    
    // Handle drag and drop for images
    const fileInputLabel = document.querySelector('.file-input-label');
    fileInputLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ff6b9d';
        this.style.backgroundColor = 'rgba(255, 107, 157, 0.2)';
    });
    
    fileInputLabel.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(255, 107, 157, 0.5)';
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    });
    
    fileInputLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(255, 107, 157, 0.5)';
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        
        const files = e.dataTransfer.files;
        handleImageFiles(files);
    });
}

// Global variables
let iconsArray = ['❤️', '💖', '💕'];
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
    const container = document.getElementById('iconsTags');
    container.innerHTML = '';
    
    iconsArray.forEach((icon, index) => {
        const tag = document.createElement('div');
        tag.className = 'tag';
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
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagesArray.push({
                    name: file.name,
                    data: e.target.result,
                    url: e.target.result
                });
                updateImagesDisplay();
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
    const container = document.getElementById('previewImages');
    container.innerHTML = '';
    
    imagesArray.forEach((image, index) => {
        const div = document.createElement('div');
        div.className = 'preview-image';
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
    
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    
    // Show loading
    loading.style.display = 'block';
    resultContainer.style.display = 'none';
    
    try {
        // Get form data
        const formData = getFormData();
        
        // Validate form data
        if (!validateFormData(formData)) {
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
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
            viewCount: 0
        };
        
        // Save to localStorage (in production, save to backend)
        saveGalaxyData(galaxyId, galaxyData);
        
        // Generate links
        const baseUrl = window.location.origin + window.location.pathname.replace('creator.html', '');
        const galaxyLink = `${baseUrl}index.html?id=${galaxyId}`;
<<<<<<< HEAD
        const shareLink = `${baseUrl}index.html?id=${galaxyId}`;
=======
        const shareLink = `${baseUrl}share.html?id=${galaxyId}`;
>>>>>>> f3e5d8181866b80a98339830a569468a6a80dfef
        
        // Show result
        showResult(galaxyLink, shareLink, galaxyId);
        
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// Get form data
function getFormData() {
    const messages = document.getElementById('messages').value
        .split('\n')
        .filter(msg => msg.trim())
        .map(msg => msg.trim());
    
    const color = document.getElementById('messageColor').value;
    const heartText = document.getElementById('heartText').value.trim();
    const enableHeart = document.getElementById('enableHeart').checked;
    const hideFooter = document.getElementById('hideFooter').checked;
    
    // Handle music file
    const musicFile = document.getElementById('backgroundMusic').files[0];
    let musicData = null;
    if (musicFile) {
        // In production, upload to server and get URL
        musicData = musicFile.name; // For now, just store filename
    }
    
    return {
        messages,
        icons: iconsArray,
        color,
        images: imagesArray.map(img => img.url),
        music: musicData,
        heartText: heartText || 'Dear You',
        enableHeart,
        hideFooter
    };
}

// Validate form data
function validateFormData(data) {
    if (!data.messages || data.messages.length === 0) {
        alert('Vui lòng nhập ít nhất một tin nhắn');
        return false;
    }
    
    if (!data.icons || data.icons.length === 0) {
        alert('Vui lòng thêm ít nhất một biểu tượng');
        return false;
    }
    
    return true;
}

// Save galaxy data
function saveGalaxyData(id, data) {
    // Save to localStorage (in production, send to backend API)
    const existingData = JSON.parse(localStorage.getItem('deargift_galaxies') || '{}');
    existingData[id] = data;
    localStorage.setItem('deargift_galaxies', JSON.stringify(existingData));
    
    // Also save metadata for listing
    const metadata = {
        id,
        title: data.messages[0] || 'Untitled Galaxy',
        createdAt: data.createdAt,
        viewCount: 0
    };
    
    const existingMeta = JSON.parse(localStorage.getItem('deargift_meta') || '[]');
    existingMeta.push(metadata);
    localStorage.setItem('deargift_meta', JSON.stringify(existingMeta));
}

// Show result
function showResult(galaxyLink, shareLink, galaxyId) {
    const resultContainer = document.getElementById('resultContainer');
    const galaxyLinkInput = document.getElementById('galaxyLink');
<<<<<<< HEAD
    const qrCodeContainer = document.getElementById('qrCode');
    
    galaxyLinkInput.value = galaxyLink;
    
    // Generate QR code using the main galaxy link
    generateQRCode(galaxyLink, qrCodeContainer);
=======
    const shareLinkInput = document.getElementById('shareLink');
    const qrCodeContainer = document.getElementById('qrCode');
    
    galaxyLinkInput.value = galaxyLink;
    shareLinkInput.value = shareLink;
    
    // Generate QR code
    generateQRCode(shareLink, qrCodeContainer);
>>>>>>> f3e5d8181866b80a98339830a569468a6a80dfef
    
    resultContainer.style.display = 'block';
    
    // Smooth scroll to result
    setTimeout(() => {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Generate QR code
function generateQRCode(url, container) {
    container.innerHTML = `
        <h4 style="margin-bottom: 15px; color: #4ecdc4;">📱 QR Code để chia sẻ</h4>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" 
             alt="QR Code" 
             style="border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
        <p style="margin-top: 10px; font-size: 12px; opacity: 0.8;">Quét mã QR để mở trên điện thoại</p>
    `;
}

// Copy link functions
function copyLink() {
    const linkInput = document.getElementById('galaxyLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast('✅ Đã sao chép link Galaxy!');
    });
}

<<<<<<< HEAD
=======
function copyShareLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast('✅ Đã sao chép link chia sẻ!');
    });
}

>>>>>>> f3e5d8181866b80a98339830a569468a6a80dfef
// Preview galaxy
function previewGalaxy() {
    const link = document.getElementById('galaxyLink').value;
    window.open(link, '_blank');
}

// Create new galaxy
function createNew() {
    if (confirm('Bạn có chắc muốn tạo galaxy mới? Thông tin hiện tại sẽ bị xóa.')) {
        location.reload();
    }
}

// Show toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
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
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize icons display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateIconsDisplay();
});

// Auto-save functionality (optional)
function autoSave() {
    const formData = {
        messages: document.getElementById('messages').value,
        icons: iconsArray,
        color: document.getElementById('messageColor').value,
        heartText: document.getElementById('heartText').value,
        enableHeart: document.getElementById('enableHeart').checked,
        hideFooter: document.getElementById('hideFooter').checked
    };
    
    localStorage.setItem('deargift_draft', JSON.stringify(formData));
}

// Load auto-saved data
function loadAutoSave() {
    const draft = localStorage.getItem('deargift_draft');
    if (draft) {
        const data = JSON.parse(draft);
        
        document.getElementById('messages').value = data.messages || '';
        document.getElementById('messageColor').value = data.color || '#ff6b9d';
        document.getElementById('colorHex').value = data.color || '#ff6b9d';
        document.getElementById('colorPreview').style.backgroundColor = data.color || '#ff6b9d';
        document.getElementById('heartText').value = data.heartText || '';
        document.getElementById('enableHeart').checked = data.enableHeart !== false;
        document.getElementById('hideFooter').checked = data.hideFooter || false;
        
        if (data.icons) {
            iconsArray = data.icons;
            updateIconsDisplay();
        }
    }
}

// Auto-save every 30 seconds
setInterval(autoSave, 30000);

// Load auto-save on page load
document.addEventListener('DOMContentLoaded', loadAutoSave);
