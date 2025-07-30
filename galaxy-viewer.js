// --- URL Params ---
const urlParams = new URLSearchParams(window.location.search);
const galaxyId = urlParams.get('id');
const isDemo = urlParams.get('demo') === '1';

// --- Demo Data ---
const demoGalaxyDataDefault = {
    messages: [
        "I love you so much! ❤️", "Our Anniverasry", "I love you 💖", "25/08/2004",
        "Thank you for being my sunshine ", "Thank you for being my everything 💕",
        "You are my universe ", "There is no other", "You're amazing",
        "You make my heart smile ", "Love ya! 💖", "Honey bunch, you are my everything! "
    ],
    icons: ["♥", "💖", "❤️", "❤️", "💕", "💕"],
    colors: '#ff6b9d',
    images: ["https://cdn.deargift.online/uploads/z6654939494311_5eacc5c2b6fdbcbee6dcd20673a8040c.jpg"],
    song: "eyenoselip.mp3",
    isHeart: true,
    textHeart: "Thế Sơn",
    isSave: true,
    createdAt: "2025-05-30T00:00:00.000Z"
};

// --- DOM refs ---
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const galaxy = document.getElementById('galaxy');
const heartContainer = document.getElementById('heartContainer');
const startButton = document.getElementById('startButton');

// --- State ---
let galaxyData = null;
let rotationX = 0, rotationY = 0, scale = 1;
let isDragging = false, lastMouseX = 0, lastMouseY = 0;
const activeParticles = new Set();
let galaxyAnimationId, heartAnimationStarted = false;
// Thêm biến theo dõi thời gian zoom cuối cùng
let lastZoomTime = 0;

// --- Responsive ---
const isMobile = window.innerWidth <= 768;
const isSmallMobile = window.innerWidth <= 480;
const maxParticles = isSmallMobile ? 80 : isMobile ? 120 : 300;
// Tăng interval để tạo particle thưa hơn
const particleInterval = isMobile ? 200 : 120;
const starCount = isSmallMobile ? 250 : isMobile ? 350 : 500;
let particleSpeedMultiplier = 1.3;

// --- Particle speed on drag/touch ---
document.addEventListener('mousedown', () => { particleSpeedMultiplier = 1.7; });
document.addEventListener('mouseup', () => { particleSpeedMultiplier = 1; });
document.addEventListener('touchstart', (e) => { if (e.touches.length === 1) particleSpeedMultiplier = 1.7; });
document.addEventListener('touchend', () => { particleSpeedMultiplier = 1; });

// --- Prevent scroll/zoom ---
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- Load galaxy data ---
async function loadGalaxyData() {
    if (isDemo) {
        // Ưu tiên lấy dữ liệu custom demo từ localStorage nếu có
        let customDemo = null;
        try {
            customDemo = localStorage.getItem('deargift_demo_data');
            if (customDemo) customDemo = JSON.parse(customDemo);
        } catch(e) { customDemo = null; }
        galaxyData = customDemo && customDemo.messages && customDemo.icons ? customDemo : demoGalaxyDataDefault;
        showStartButton();
        loadingScreen.style.display = 'none';
        return;
    }
    
    if (!galaxyId) { 
        console.warn('No galaxy ID provided. Switching to demo mode...');
        // Tự động chuyển sang chế độ demo nếu không có ID
        galaxyData = demoGalaxyDataDefault;
        showStartButton();
        loadingScreen.style.display = 'none';
        return;
    }
    
    try {
        console.log('Loading galaxy with ID:', galaxyId);
        
        // First try to load from localStorage (local galaxies)
        const localGalaxies = JSON.parse(localStorage.getItem('deargift_galaxies') || '{}');
        if (localGalaxies[galaxyId]) {
            console.log('Galaxy found in localStorage');
            galaxyData = localGalaxies[galaxyId];
            
            // Increment view count
            if (!galaxyData.viewCount) galaxyData.viewCount = 0;
            galaxyData.viewCount++;
            localGalaxies[galaxyId] = galaxyData;
            localStorage.setItem('deargift_galaxies', JSON.stringify(localGalaxies));
            
            showStartButton();
            loadingScreen.style.display = 'none';
            return;
        }
        
        // If not found locally, try to fetch from API
        const response = await fetch(`https://dearlove-backend.onrender.com/api/galaxies/${galaxyId}`);
        if (!response.ok) { 
            console.error('API response not OK:', response.status, response.statusText);
            showError(); 
            return; 
        }
        const data = await response.json();
        if (!data || !data.data) { 
            console.error('Invalid data received from API');
            showError(); 
            return; 
        }
        galaxyData = data.data;
        console.log('Galaxy data loaded successfully from API');
        showStartButton();
    } catch (error) {
        console.error('Error loading galaxy:', error);
        showError();
    }
}

function showError() {
    loadingScreen.style.display = 'none';
    errorScreen.style.display = 'flex';
}



function showStartButton() {

    startButton.classList.add('active');
    startButton.addEventListener('click', () => {
      const helpDialog = document.getElementById('helpDialog');
            helpDialog.classList.add('hide');


        const copyrightFooter = document.getElementById('copyrightFooter');
        // Chỉ xử lý khi galaxyData.isSave đã có (không undefined/null)
        if (copyrightFooter && typeof galaxyData.isSave === 'boolean') {
            if (galaxyData.isSave) {
                // Ẩn luôn nếu isSave true
                copyrightFooter.style.display = 'none';
            } else {
                // Hiện 5s rồi ẩn nếu isSave false
                copyrightFooter.style.display = 'block';
                copyrightFooter.style.opacity = '0.7';
                setTimeout(() => {
                    copyrightFooter.style.display = 'none';
                }, 5000);
            }
        } else if (copyrightFooter) {
            // Nếu chưa có isSave, ẩn luôn
            copyrightFooter.style.display = 'none';
        }

        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            initializeGalaxy();
            initializeAudio();
        }, 500);
    });
}

// --- Initialize galaxy ---
function initializeGalaxy() {
    const heartTextDiv = document.getElementById('heartText');
    if (heartTextDiv) {
        heartTextDiv.textContent = galaxyData.textHeart || '';
    }

    detectBrowserAndDevice();
    createStars();
    startParticleAnimation();

    if (galaxyData.isHeart === true) {
        setTimeout(() => {
            if (document.getElementById('doubleClickTip')) return;
            const tip = document.createElement('div');
            tip.id = 'doubleClickTip';
            tip.className = 'double-click-tip';
            tip.textContent = 'click 2 lần vào màn hình nha💖';
            document.body.appendChild(tip);

            setTimeout(() => {
                if (document.body.contains(tip)) tip.remove();
            }, 3000);

            function handleDblClick(event) {
                if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.closest('.help-dialog')) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                if (!heartAnimationStarted) {
                    tip.remove();
                    transitionToHeart();
                    window.removeEventListener('dblclick', handleDblClick);
                    window.removeEventListener('touchend', handleTouchDblTap);
                }
            }

            let lastTap = 0;
            function handleTouchDblTap(e) {
                // Kiểm tra nếu là thao tác nhiều ngón
                if (e.touches && e.touches.length > 1) {
                    lastTap = 0; // Reset lastTap nếu là thao tác nhiều ngón
                    return;
                }
                
                // Kiểm tra nếu vừa mới zoom xong (trong vòng 1 giây)
                const now = Date.now();
                if (now - lastZoomTime < 1000) {
                    lastTap = 0; // Reset lastTap nếu vừa mới zoom
                    return;
                }
                
                // Xử lý double tap bình thường
                if (now - lastTap < 800) {
                    handleDblClick(e);
                    lastTap = 0; // Reset để không bị trigger liên tục
                } else {
                    lastTap = now;
                }
            }

            window.addEventListener('dblclick', handleDblClick);
            window.addEventListener('touchend', handleTouchDblTap);
        }, 8000);
    }
}

// --- Audio ---
// --- Audio ---
function initializeAudio() {
    if (!galaxyData.song) return;
    const audio = document.getElementById('galaxyAudio');
    
    // Sửa logic xử lý đường dẫn
    let audioSrc;
    if (galaxyData.song.startsWith('http')) {
        // URL đầy đủ
        audioSrc = galaxyData.song;
    } else if (galaxyData.song.startsWith('songs/')) {
        // Đã có tiền tố songs/
        audioSrc = galaxyData.song;
    } else {
        // Chỉ có tên file
        audioSrc = `songs/${galaxyData.song}`;
    }
    
    audio.src = audioSrc;
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = 0.7;

    // Play audio on start button click
    audio.play().catch((error) => {
        console.error('Audio play error:', error);
        console.log('Attempted to load:', audioSrc);
        // Thêm fallback hoặc thông báo cho user
    });
}

// --- Device detection ---
function detectBrowserAndDevice() {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome/i.test(ua);
    const isFirefox = /Firefox/i.test(ua);
    const isSamsung = /SamsungBrowser/i.test(ua);
}

// --- Particle helpers ---
function getRandomMessage() {
    return galaxyData.messages[Math.floor(Math.random() * galaxyData.messages.length)];
}
function getRandomIcon() {
    return galaxyData.icons[Math.floor(Math.random() * galaxyData.icons.length)];
}

// --- Create text particle ---
function createTextParticle() {
    if (activeParticles.size >= maxParticles || heartAnimationStarted) return;
    const isIcon = Math.random() > 0.85; // Thay đổi từ 0.7 thành 0.85 để giảm tỷ lệ xuất hiện biểu tượng
    const element = document.createElement('div');

    element.className = 'text-particle';
    if (isIcon) {
        element.textContent = getRandomIcon();
    } else {
        element.textContent = getRandomMessage();
    }
    element.style.color = galaxyData.colors || '#ff6b9d';
    element.style.textShadow = `0 0 15px ${galaxyData.colors || '#ff6b9d'}, 0 0 25px ${galaxyData.colors || '#ff6b9d'}, 2px 2px 6px rgba(0,0,0,0.9)`;

    // Tạo xong mới random vị trí theo pixel
    galaxy.appendChild(element);
    const displayWidth = element.offsetWidth || 100;
    galaxy.removeChild(element);
    // Tăng vùng tạo trên mobile
    const margin = isMobile ? 0.35 : 0.15;
    const minX = -window.innerWidth * margin;
    const maxX = window.innerWidth * (1 + margin) - displayWidth;
    const xPos = minX + Math.random() * (maxX - minX);
    element.style.left = xPos + 'px';

    const zPos = (Math.random() - 0.5) * (isMobile ? 300 : 500);
    const animationDuration = (Math.random() * 2 + (isMobile ? 3 : 3)) * 2;
    // Tăng font chữ trên desktop
    const baseFontSize = isSmallMobile ? 18 : isMobile ? 18 : 24; // Desktop: 24px
    const fontSizeVariation = isSmallMobile ? 8 : isMobile ? 8 : 10; // Desktop: random thêm 0-10px
    element.style.fontSize = (Math.random() * fontSizeVariation + baseFontSize) + 'px';
    const depthOpacity = Math.max(0.4, 1 - Math.abs(zPos) / (isMobile ? 250 : 400));
    element.style.opacity = depthOpacity;
    // Tăng khoảng rơi theo chiều cao trên mobile
    let startTime = null;
    const startY = isMobile ? -300 : -150;
    const endY = isMobile ? window.innerHeight + 300 : window.innerHeight + 150;
    const thisParticleSpeed = particleSpeedMultiplier;
    function animateParticle(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (animationDuration * 1000 * thisParticleSpeed);
        if (progress < 1 && !heartAnimationStarted) {
            const currentY = startY + (endY - startY) * progress;
            const opacity = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : depthOpacity;
            element.style.transform = `translate3d(0, ${currentY}px, ${zPos}px)`;
            element.style.opacity = opacity;
            requestAnimationFrame(animateParticle);
        } else {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
                activeParticles.delete(element);
            }
        }
    }
    galaxy.appendChild(element);
    activeParticles.add(element);
    requestAnimationFrame(animateParticle);
}

// --- Create image particle ---
function createImageParticle() {
    if (!galaxyData.images || galaxyData.images.length === 0 || activeParticles.size >= maxParticles) return;
    // Tạo div bọc ngoài
    const wrapper = document.createElement('div');
    wrapper.className = 'text-particle image-particle';
    wrapper.style.position = 'absolute';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.borderRadius = '15px';
    wrapper.style.overflow = 'visible';
    wrapper.style.border = 'none';
    // Tạo img bên trong
    const img = document.createElement('img');
    img.src = galaxyData.images[Math.floor(Math.random() * galaxyData.images.length)];
    img.style.display = 'block';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '15px';
    img.style.margin = '0';
    img.style.padding = '0';
    img.style.border = 'none';
    wrapper.appendChild(img);
    // Khi ảnh load xong, set width/height cho wrapper và img, random vị trí left theo pixel
    img.onload = function() {
        // Giảm maxHeight trên mobile
        const maxHeight = isMobile ? 100 : 130;
        let ratio = 1;
        if (img.naturalHeight > maxHeight) {
            ratio = maxHeight / img.naturalHeight;
        }
        const displayWidth = Math.round(img.naturalWidth * ratio);
        const displayHeight = Math.round(img.naturalHeight * ratio);
        wrapper.style.width = displayWidth + 'px';
        wrapper.style.height = displayHeight + 'px';
        img.style.width = displayWidth + 'px';
        img.style.height = displayHeight + 'px';
        // Tăng vùng tạo trên mobile
        const margin = isMobile ? 0.35 : 0.2;
        const minX = -window.innerWidth * margin;
        const maxX = window.innerWidth * (1 + margin) - displayWidth;
        const xPos = minX + Math.random() * (maxX - minX);
        wrapper.style.left = xPos + 'px';
    };
    // Tăng khoảng rơi theo chiều cao trên mobile
    const zPos = (Math.random() - 0.5) * (isMobile ? 300 : 500);
    const animationDuration = (Math.random() * 2 + (isMobile ? 3 : 3)) * 2;
    let startTime = null;
    const startY = isMobile ? -300 : -150;
    const endY = isMobile ? window.innerHeight + 300 : window.innerHeight + 150;
    const thisParticleSpeed = particleSpeedMultiplier;
    function animateParticle(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (animationDuration * 1000 * thisParticleSpeed);
        if (progress < 1) {
            const currentY = startY + (endY - startY) * progress;
            const opacity = progress < 0.05 ? progress * 20 : progress > 0.95 ? (1 - progress) * 20 : 1;
            wrapper.style.transform = `translate3d(0, ${currentY}px, ${zPos}px)`;
            wrapper.style.opacity = opacity;
            requestAnimationFrame(animateParticle);
        } else {
            if (wrapper.parentNode) {
                wrapper.parentNode.removeChild(wrapper);
                activeParticles.delete(wrapper);
            }
        }
    }
    galaxy.appendChild(wrapper);
    activeParticles.add(wrapper);
    requestAnimationFrame(animateParticle);
}

// --- Create stars ---
function createStars() {
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const angle = Math.random() * Math.PI * 10;
        const radius = Math.random() * (isMobile ? 800 : 1500) + (isMobile ? 200 : 300);
        const spiralHeight = Math.sin(angle) * (isMobile ? 100 : 150);
        const x = Math.cos(angle) * radius;
        const y = spiralHeight + (Math.random() - 0.5) * (isMobile ? 1000 : 2000);
        const z = Math.sin(angle) * radius * 0.5;
        star.style.left = `calc(50% + ${x}px)`;
        star.style.top = `calc(50% + ${y}px)`;
        star.style.transform = `translateZ(${z}px)`;
        star.style.animationDelay = Math.random() * 3 + 's';
        const depthBrightness = Math.max(0.1, 1 - Math.abs(z) / (isMobile ? 800 : 1200));
        star.style.opacity = depthBrightness;
        galaxy.appendChild(star);
    }
}

// --- Galaxy transform ---
function updateGalaxyTransform() {
    requestAnimationFrame(() => {
        galaxy.style.transform = `translate(-50%, -50%) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`;
    });
}

// --- Particle animation ---
function startParticleAnimation() {
    setInterval(() => {
        if (heartAnimationStarted) return;
        // Chỉ tạo particle mới nếu chưa vượt quá maxParticles
        if (activeParticles.size < maxParticles) {
            if (galaxyData.images && galaxyData.images.length > 0 && Math.random() < 0.1) {
                createImageParticle();
            } else {
                createTextParticle();
            }
        }
    }, particleInterval);

    const initialParticles = isMobile ? 10 : 15;
    for (let i = 0; i < initialParticles; i++) {
        setTimeout(() => {
            if (activeParticles.size < maxParticles) {
                if (galaxyData.images && galaxyData.images.length > 0 && Math.random() < 0.08) {
                    createImageParticle();
                } else {
                    createTextParticle();
                }
            }
        }, i * (particleInterval * 0.6));
    }

    galaxyAnimationId = setInterval(() => {
        if (!heartAnimationStarted && activeParticles.size < maxParticles) createTextParticle();
    }, particleInterval);
}

// --- Mouse events (desktop) ---
document.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        // Giảm sensitivity để xoay mượt hơn
        const sensitivity = isMobile ? 0.12 : 0.10;
        rotationY += deltaX * sensitivity;
        rotationX -= deltaY * sensitivity;
        updateGalaxyTransform();
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});
document.addEventListener('mouseup', () => { isDragging = false; });
// Thêm các biến này vào phần khai báo biến global (sau dòng let galaxyAnimationId...)
let initialDistance = 0;
let initialScale = 1;

// Thay thế toàn bộ phần Touch events bằng code này:

// --- Touch events (mobile) ---
document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.help-dialog')) {
        return;
    }
    e.preventDefault();
    
    if (e.touches.length === 1) {
        // Single touch - for dragging
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Two fingers - for zooming
        isDragging = false;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate initial distance between two fingers
        initialDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = scale;
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.help-dialog')) {
        return;
    }
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
        // Single finger drag - rotate galaxy
        const deltaX = e.touches[0].clientX - lastMouseX;
        const deltaY = e.touches[0].clientY - lastMouseY;
        // Giảm sensitivity để xoay mượt hơn
        const sensitivity = 0.12;
        rotationY += deltaX * sensitivity;
        rotationX -= deltaY * sensitivity;
        updateGalaxyTransform();
        
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Two fingers - zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate current distance
        const currentDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // Calculate scale change
        if (initialDistance > 0) {
            const scaleChange = currentDistance / initialDistance;
            scale = Math.max(0.3, Math.min(3, initialScale * scaleChange));
            updateGalaxyTransform();
            // Cập nhật thời gian zoom cuối cùng
            lastZoomTime = Date.now();
        }
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.help-dialog')) {
        return;
    }
    e.preventDefault();
    
    // Reset dragging state
    isDragging = false;
    
    // Reset zoom variables if no touches remain
    if (e.touches.length === 0) {
        initialDistance = 0;
        initialScale = scale;
    }
}, { passive: false });

// Thêm hỗ trợ zoom bằng mouse wheel cho desktop
document.addEventListener('wheel', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.help-dialog')) {
        return;
    }
    e.preventDefault();
    
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    
    scale = Math.max(0.3, Math.min(3, scale + delta));
    updateGalaxyTransform();
}, { passive: false });

// --- Orientation change ---
window.addEventListener('orientationchange', () => {
    setTimeout(() => { location.reload(); }, 100);
});

// --- Heart transition ---
function transitionToHeart() {
    heartAnimationStarted = true;
    if (galaxyAnimationId) clearInterval(galaxyAnimationId);

    const fallingImages = document.querySelectorAll('.falling-image');
    fallingImages.forEach(img => {
        img.style.transition = 'opacity 1.5s';
        img.style.opacity = '0';
    });
    const particles = document.querySelectorAll('.text-particle');
    particles.forEach(el => {
        el.style.transition = 'opacity 1.5s';
        el.style.opacity = '0';
    });

    setTimeout(() => {
        heartContainer.classList.add('active');
        initializeHeartAnimation();
    }, 1500);
}

// --- Heart animation ---
function initializeHeartAnimation() {
    var settings = {
        particles: {
            length: isMobile ? 5000 : 10000,
            duration: 4,
            velocity: isMobile ? 50 : 80,
            effect: -1.3,
            size: isMobile ? 6 : 8,
        },
    };
    (function () { var b = 0; var c = ["ms", "moz", "webkit", "o"]; for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) { window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"]; window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"] } if (!window.requestAnimationFrame) { window.requestAnimationFrame = function (h, e) { var d = new Date().getTime(); var f = Math.max(0, 16 - (d - b)); var g = window.setTimeout(function () { h(d + f) }, f); b = d + f; return g } } if (!window.cancelAnimationFrame) { window.cancelAnimationFrame = function (d) { clearTimeout(d) } } }());
    var Point = (function () {
        function Point(x, y) { this.x = (typeof x !== 'undefined') ? x : 0; this.y = (typeof y !== 'undefined') ? y : 0; }
        Point.prototype.clone = function () { return new Point(this.x, this.y); };
        Point.prototype.length = function (length) {
            if (typeof length == 'undefined') return Math.sqrt(this.x * this.x + this.y * this.y);
            this.normalize(); this.x *= length; this.y *= length; return this;
        };
        Point.prototype.normalize = function () {
            var length = this.length(); this.x /= length; this.y /= length; return this;
        };
        return Point;
    })();
    var Particle = (function () {
        function Particle() { this.position = new Point(); this.velocity = new Point(); this.acceleration = new Point(); this.age = 0; }
        Particle.prototype.initialize = function (x, y, dx, dy) {
            this.position.x = x; this.position.y = y; this.velocity.x = dx; this.velocity.y = dy;
            this.acceleration.x = dx * settings.particles.effect; this.acceleration.y = dy * settings.particles.effect; this.age = 0;
        };
        Particle.prototype.update = function (deltaTime) {
            this.position.x += this.velocity.x * deltaTime; this.position.y += this.velocity.y * deltaTime;
            this.velocity.x += this.acceleration.x * deltaTime; this.velocity.y += this.acceleration.y * deltaTime;
            this.age += deltaTime;
        };
        Particle.prototype.draw = function (context, image) {
            function ease(t) { return (--t) * t * t + 1; }
            var size = image.width * ease(this.age / settings.particles.duration);
            context.globalAlpha = 1 - this.age / settings.particles.duration;
            context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
        };
        return Particle;
    })();
    var ParticlePool = (function () {
        var particles, firstActive = 0, firstFree = 0, duration = settings.particles.duration;
        function ParticlePool(length) {
            particles = new Array(length);
            for (var i = 0; i < particles.length; i++) particles[i] = new Particle();
        }
        ParticlePool.prototype.add = function (x, y, dx, dy) {
            particles[firstFree].initialize(x, y, dx, dy);
            firstFree++; if (firstFree == particles.length) firstFree = 0;
            if (firstActive == firstFree) firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        };
        ParticlePool.prototype.update = function (deltaTime) {
            var i;
            if (firstActive < firstFree) {
                for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
            }
            if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) particles[i].update(deltaTime);
                for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
            }
            while (particles[firstActive].age >= duration && firstActive != firstFree) {
                firstActive++; if (firstActive == particles.length) firstActive = 0;
            }
        };
        ParticlePool.prototype.draw = function (context, image) {
            var i;
            if (firstActive < firstFree) {
                for (i = firstActive; i < firstFree; i++) particles[i].draw(context, image);
            }
            if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) particles[i].draw(context, image);
                for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
            }
        };
        return ParticlePool;
    })();
    (function (canvas) {
        var context = canvas.getContext('2d'),
            particles = new ParticlePool(settings.particles.length),
            particleRate = settings.particles.length / settings.particles.duration,
            time;
        function pointOnHeart(t) {
            return new Point(
                160 * Math.pow(Math.sin(t), 3),
                130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
            );
        }
        var image = (function () {
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d');
            canvas.width = settings.particles.size;
            canvas.height = settings.particles.size;
            function to(t) {
                var point = pointOnHeart(t);
                point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
                point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
                return point;
            }
            context.beginPath();
            var t = -Math.PI;
            var point = to(t);
            context.moveTo(point.x, point.y);
            while (t < Math.PI) {
                t += 0.01;
                point = to(t);
                context.lineTo(point.x, point.y);
            }
            context.closePath();
            context.fillStyle = '#f50b02';
            context.fill();
            var image = new Image();
            image.src = canvas.toDataURL();
            return image;
        })();
        function render() {
            requestAnimationFrame(render);
            var newTime = new Date().getTime() / 1000,
                deltaTime = newTime - (time || newTime);
            time = newTime;
            context.clearRect(0, 0, canvas.width, canvas.height);
            var amount = particleRate * deltaTime;
            for (var i = 0; i < amount; i++) {
                var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
                var dir = pos.clone().length(settings.particles.velocity);
                particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
            }
            particles.update(deltaTime);
            particles.draw(context, image);
        }
        function onResize() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        window.addEventListener('resize', onResize);
        setTimeout(function () {
            onResize();
            render();
        }, 10);
    })(document.getElementById('pinkboard'));
}

// --- Init ---
loadGalaxyData();