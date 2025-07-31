// --- URL Params (Safari compatible) ---
var urlParams = new URLSearchParams(window.location.search);
var galaxyId = urlParams.get('id');
var tempId = urlParams.get('tempId'); // For demo preview
var isDemo = urlParams.get('demo') === '1' || window.isDemoFallback;

// --- Demo Data ---
var demoGalaxyDataDefault = {
    messages: [
        "Anh yêu em nhiều lắm! ❤️", "Kỷ niệm của chúng ta", "Em là tất cả của anh 💖", "25/08/2004",
        "Cảm ơn em đã là ánh nắng của anh ", "Cảm ơn em đã là tất cả 💕",
        "Em là vũ trụ của anh ", "Không có ai khác", "Em thật tuyệt vời",
        "Em làm trái tim anh mỉm cười ", "Yêu em! 💖", "Em yêu, em là tất cả của anh! "
    ],
    icons: ["♥", "💖", "❤️", "❤️", "💕", "💕"],
    colors: '#ff6b9d',
    images: [""],
    song: "./songs/anh_la_cua_em.webm", // Use WebM for better web compatibility
    isHeart: true,
    textHeart: "Yêu Em",
    isSave: true,
    createdAt: "2025-05-30T00:00:00.000Z"
};

// Available songs list
var availableSongs = {
    love: [
        { id: "love1", name: "Anh Là Của Em - Karik ft. Lou Hoàng", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love2", name: "Yêu Là Tha Thu - Onlyc ft. Karik", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love3", name: "Em Của Ngày Hôm Qua - Sơn Tùng M-TP", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love4", name: "Có Chàng Trai Viết Lên Cây - Phan Mạnh Quỳnh", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love5", name: "3107 - W/n ft. Duongg", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love6", name: "Nắng Ấm Xa Dần - Sơn Tùng M-TP", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love7", name: "Anh Đang Ở Đâu Đấy Anh - Hương Giang", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "love8", name: "Thật Bất Ngờ - Trúc Nhân", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" }
    ],
    birthday: [
        { id: "birthday1", name: "Chúc Mừng Sinh Nhật - Mỹ Tâm", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "birthday2", name: "Happy Birthday - Tuấn Hưng", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "birthday3", name: "Sinh Nhật Không Muốn Quên - Mr. Siro", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "birthday4", name: "Tuổi 17 - Nguyễn Đình Vũ", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "birthday5", name: "Chúc Mừng Sinh Nhật (Instrumental)", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "birthday6", name: "Một Năm Mới Bình An - Lynk Lee", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" }
    ],
    trending: [
        { id: "trend1", name: "See Tình - Hoàng Thùy Linh", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "trend2", name: "Đom Đóm - Jack", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "trend3", name: "Muộn Rồi Mà Sao Còn - Sơn Tùng M-TP", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "trend4", name: "Hoa Hải Đường - Jack", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "trend5", name: "Về Nghe Mẹ Ru - HIEUTHUHAI ft. Hoàng Dũng", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" }
    ],
    instrumental: [
        { id: "inst1", name: "Đàn Piano Nhẹ Nhàng", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "inst2", name: "Guitar Acoustic Việt Nam", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "inst3", name: "Đàn Tranh Truyền Thống", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "inst4", name: "Sáo Trúc Việt Nam", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" },
        { id: "inst5", name: "Nhạc Thiền Yên Bình", url: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav" }
    ]
};

// --- DOM refs ---
var loadingScreen = document.getElementById('loadingScreen');
var errorScreen = document.getElementById('errorScreen');
var galaxy = document.getElementById('galaxy');
var heartContainer = document.getElementById('heartContainer');
var startButton = document.getElementById('startButton');

// --- State ---
var galaxyData = null;
var rotationX = 0, rotationY = 0, scale = 1;
var isDragging = false, lastMouseX = 0, lastMouseY = 0;
var activeParticles = new Set();
var galaxyAnimationId, heartAnimationStarted = false;
// Thêm biến theo dõi thời gian zoom cuối cùng
var lastZoomTime = 0;

// --- Responsive ---
var isMobile = window.innerWidth <= 768;
var isSmallMobile = window.innerWidth <= 480;
var maxParticles = isSmallMobile ? 80 : isMobile ? 120 : 300;
// Tăng interval để tạo particle thưa hơn
var particleInterval = isMobile ? 200 : 120;
var starCount = isSmallMobile ? 250 : isMobile ? 350 : 500;
var particleSpeedMultiplier = 1.3;

// --- Particle speed on drag/touch ---
document.addEventListener('mousedown', function() { particleSpeedMultiplier = 1.7; });
document.addEventListener('mouseup', function() { particleSpeedMultiplier = 1; });
document.addEventListener('touchstart', function(e) { if (e.touches.length === 1) particleSpeedMultiplier = 1.7; });
document.addEventListener('touchend', function() { particleSpeedMultiplier = 1; });

// --- Prevent scroll/zoom ---
document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
document.addEventListener('wheel', function(e) { e.preventDefault(); }, { passive: false });

// --- Load galaxy data (Safari compatible) ---
function loadGalaxyData() {
    console.log('=== DEBUG loadGalaxyData ===');
    console.log('Current URL:', window.location.href);
    console.log('Galaxy ID from URL:', galaxyId);
    console.log('Is Demo mode:', isDemo);
    
    if (isDemo) {
        // Check for temporary demo data first (from creator preview)
        if (tempId) {
            try {
                var tempDemo = localStorage.getItem('temp_demo_galaxy');
                if (tempDemo) {
                    tempDemo = JSON.parse(tempDemo);
                    if (tempDemo.id === tempId) {
                        galaxyData = {
                            messages: [tempDemo.message || 'Welcome to your galaxy preview!'],
                            icons: ["♥", "💖", "❤️"],
                            colors: '#ff6b9d',
                            images: tempDemo.images || [""],
                            song: tempDemo.musicUrl || null,
                            isHeart: true,
                            textHeart: tempDemo.title || "Demo Galaxy",
                            isSave: true,
                            createdAt: tempDemo.createdAt || new Date().toISOString(),
                            musicVolume: tempDemo.musicVolume || 0.5
                        };
                        showStartButton();
                        loadingScreen.style.display = 'none';
                        return;
                    }
                }
            } catch(e) {
                console.warn('Error loading temp demo data:', e);
            }
        }
        
        // Ưu tiên lấy dữ liệu custom demo từ localStorage nếu có
        var customDemo = null;
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
        var localGalaxies = JSON.parse(localStorage.getItem('deargift_galaxies') || '{}');
        console.log('Available galaxies in localStorage:', Object.keys(localGalaxies));
        console.log('Looking for galaxy ID:', galaxyId);
        
        if (localGalaxies[galaxyId]) {
            console.log('Galaxy found in localStorage');
            galaxyData = localGalaxies[galaxyId];
            console.log('LocalStorage galaxy data details:', {
                id: galaxyData.id,
                hasMessages: !!galaxyData.messages,
                messageCount: galaxyData.messages ? galaxyData.messages.length : 0,
                hasMusic: !!galaxyData.song,
                musicSource: galaxyData.song || 'No music',
                hasImages: !!galaxyData.images && galaxyData.images.length > 0
            });
            
            // Increment view count
            if (!galaxyData.viewCount) galaxyData.viewCount = 0;
            galaxyData.viewCount++;
            localGalaxies[galaxyId] = galaxyData;
            localStorage.setItem('deargift_galaxies', JSON.stringify(localGalaxies));
            
            showStartButton();
            loadingScreen.style.display = 'none';
            return;
        }
        
        console.log('Galaxy not found in localStorage, trying Firestore...');
        
        // Try Firebase/Firestore (với Promise thay vì async/await)
        loadFromFirestore(galaxyId);
        
    } catch (error) {
        console.error('Error loading galaxy:', error);
        showError();
    }
}

function loadFromFirestore(galaxyId) {
    // Khởi tạo Firebase nếu chưa có
    if (typeof firebase === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        document.head.appendChild(script);
        
        script.onload = function() {
            var script2 = document.createElement('script');
            script2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';
            document.head.appendChild(script2);
            
            script2.onload = function() {
                initFirebaseAndLoad(galaxyId);
            };
        };
    } else {
        initFirebaseAndLoad(galaxyId);
    }
}

function initFirebaseAndLoad(galaxyId) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyDsQzklj9EplxSPFltI3kRVjzIu8DILwko",
                authDomain: "deargift-f780b.firebaseapp.com",
                projectId: "deargift-f780b",
                storageBucket: "deargift-f780b.appspot.com",
                messagingSenderId: "329430119253",
                appId: "1:329430119253:web:71a099c215370092eeb5dc",
                measurementId: "G-NSJHP66HKW"
            });
        }
        var db = firebase.firestore();
        db.collection('galaxies').doc(galaxyId).get().then(function(doc) {
            if (!doc.exists) {
                console.error('Galaxy not found in Firestore');
                showError();
                return;
            }
            galaxyData = doc.data();
            console.log('Galaxy data loaded successfully from Firestore');
            console.log('Galaxy data details:', {
                id: galaxyData.id,
                hasMessages: !!galaxyData.messages,
                messageCount: galaxyData.messages ? galaxyData.messages.length : 0,
                hasMusic: !!galaxyData.song,
                musicSource: galaxyData.song || 'No music',
                hasImages: !!galaxyData.images && galaxyData.images.length > 0
            });
            showStartButton();
        }).catch(function(error) {
            console.error('Error loading galaxy from Firestore:', error);
            showError();
        });
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showError();
    }
}

function showError() {
    loadingScreen.style.display = 'none';
    
    // Trên Safari, nếu có lỗi, tự động chuyển sang demo mode
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari && !isDemo) {
        console.log('Safari detected, switching to demo mode on error');
        galaxyData = demoGalaxyDataDefault;
        showStartButton();
        return;
    }
    
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
            
            // Always show music control button
            var musicBtn = document.getElementById('musicControlBtn');
            if (musicBtn) {
                musicBtn.style.display = 'flex';
                console.log('Music button displayed');
            }
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

// --- Audio (Safari compatible) ---
function initializeAudio() {
    var audio = document.getElementById('galaxyAudio');
    
    // Always show music control, even if no song is set
    if (!galaxyData.song) {
        console.log('No song set in galaxy data, showing music selector');
        createMusicSelector();
        return;
    }
    
    // Sửa logic xử lý đường dẫn với format fallback
    var audioSrc;
    var fallbackSrc;
    
    // Check if this is an uploaded file that won't exist on production
    if (galaxyData.song.includes('uploads/temp_') || galaxyData.song.includes('./songs/uploads/')) {
        console.log('Detected uploaded file, using fallback demo music:', galaxyData.song);
        audioSrc = './songs/anh_la_cua_em.webm'; // Use WebM demo music
        fallbackSrc = './songs/anh_la_cua_em.mp4'; // MP4 fallback
        
        // Show notification that we're using demo music
        setTimeout(function() {
            var musicBtn = document.getElementById('musicControlBtn');
            if (musicBtn) {
                var musicText = document.getElementById('musicText');
                if (musicText) {
                    musicText.innerHTML = 'Nhạc demo';
                    musicText.style.fontSize = '12px';
                }
            }
        }, 2000);
        
    } else if (galaxyData.song.startsWith('http')) {
        // URL đầy đủ
        audioSrc = galaxyData.song;
    } else if (galaxyData.song.startsWith('./songs/')) {
        // Đã có tiền tố ./songs/
        audioSrc = galaxyData.song;
        // Create fallback: if .webm, fallback to .mp4 and vice versa
        if (audioSrc.endsWith('.webm')) {
            fallbackSrc = audioSrc.replace('.webm', '.mp4');
        } else if (audioSrc.endsWith('.mp4')) {
            fallbackSrc = audioSrc.replace('.mp4', '.webm');
        }
    } else if (galaxyData.song.startsWith('songs/')) {
        // Có tiền tố songs/
        audioSrc = galaxyData.song;
        if (audioSrc.endsWith('.webm')) {
            fallbackSrc = audioSrc.replace('.webm', '.mp4');
        } else if (audioSrc.endsWith('.mp4')) {
            fallbackSrc = audioSrc.replace('.mp4', '.webm');
        }
    } else {
        // Chỉ có tên file
        audioSrc = 'songs/' + galaxyData.song;
    }
    
    console.log('Loading audio:', audioSrc);
    if (fallbackSrc) console.log('Fallback audio:', fallbackSrc);
    
    // Function to try loading audio
    function tryLoadAudio(src, isRetry) {
        audio.src = src;
        audio.loop = true;
        audio.preload = 'metadata';
        audio.volume = 0.5;
        
        // Safari audio fix - muted autoplay
        audio.muted = true;
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        
        // Load audio
        audio.load();
        
        if (!isRetry) {
            // Always show music control button when audio is set
            createAudioControls();
        }
    }
    
    // Try primary audio source
    tryLoadAudio(audioSrc, false);
    
    // Handle audio loading
    audio.addEventListener('loadstart', function() {
        console.log('Audio loading started');
    });
    
    audio.addEventListener('canplay', function() {
        console.log('Audio can play');
        // Update button state if needed
        var musicBtn = document.getElementById('musicControlBtn');
        if (musicBtn && musicBtn.classList.contains('error')) {
            createAudioControls(); // Remove error state
        }
    });
    
    audio.addEventListener('error', function(e) {
        console.error('Audio error:', e);
        console.log('Failed to load:', audio.src);
        
        // Try fallback if available and not already tried
        if (fallbackSrc && audio.src !== fallbackSrc) {
            console.log('Trying fallback audio:', fallbackSrc);
            tryLoadAudio(fallbackSrc, true);
            return;
        }
        
        // If fallback also fails or no fallback, try demo music
        if (!audio.src.includes('anh_la_cua_em')) {
            console.log('All sources failed, using demo music');
            tryLoadAudio('./songs/anh_la_cua_em.webm', true);
            
            // Show notification
            setTimeout(function() {
                var musicBtn = document.getElementById('musicControlBtn');
                if (musicBtn) {
                    var musicText = document.getElementById('musicText');
                    if (musicText) {
                        musicText.innerHTML = 'Nhạc demo';
                        musicText.style.fontSize = '12px';
                    }
                }
            }, 2000);
        } else {
            // Even demo music failed, show error state
            createAudioControls(true);
        }
    });
    
    // Try to play when user interacts (Safari requirement)
    var playAudio = function() {
        audio.muted = false;
        audio.play().then(function() {
            console.log('Audio playing successfully');
        }).catch(function(error) {
            console.error('Audio play error:', error);
            // Fallback: show manual play button
            createAudioControls(true);
        });
    };
    
    // Add event listeners for user interaction
    document.addEventListener('touchstart', playAudio, { once: true });
    document.addEventListener('click', playAudio, { once: true });
}

// Create music selector when no song is set
function createMusicSelector() {
    var musicBtn = document.getElementById('musicControlBtn');
    
    if (musicBtn) {
        musicBtn.style.display = 'flex';
        document.getElementById('musicIcon').innerHTML = '🎵';
        document.getElementById('musicText').innerHTML = 'Chọn nhạc';
        
        // Change onclick behavior to show music selector
        musicBtn.onclick = function() {
            showMusicSelectorDialog();
        };
    }
}

// Show music selector dialog
function showMusicSelectorDialog() {
    // Remove existing dialog if any
    var existingDialog = document.getElementById('musicSelectorDialog');
    if (existingDialog) existingDialog.remove();
    
    var dialog = document.createElement('div');
    dialog.id = 'musicSelectorDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 15px;
        z-index: 1003;
        max-width: 90%;
        width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: 'Orbitron', sans-serif;
        box-shadow: 0 0 30px rgba(255, 107, 157, 0.5);
        border: 2px solid rgba(255, 107, 157, 0.3);
    `;
    
    var html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #ff6b9d; margin: 0;">Chọn Nhạc</h2>
            <button onclick="closeMusicSelector()" style="background: none; border: none; color: #ff6b9d; font-size: 20px; cursor: pointer;">✖</button>
        </div>
        
        <div style="margin-bottom: 15px;">
            <h3 style="color: #ff6b9d; font-size: 1rem; margin-bottom: 10px;">🎵 Nhạc Tình Yêu</h3>
            <div id="loveSongs"></div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <h3 style="color: #ff6b9d; font-size: 1rem; margin-bottom: 10px;">🎂 Nhạc Sinh Nhật</h3>
            <div id="birthdaySongs"></div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <h3 style="color: #ff6b9d; font-size: 1rem; margin-bottom: 10px;">📁 Tải Nhạc Lên</h3>
            <input type="file" id="uploadMusicInput" accept="audio/*" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ff6b9d; background: rgba(255, 255, 255, 0.1); color: white;">
            <button onclick="uploadCustomMusic()" style="background: #ff6b9d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; width: 100%;">Tải lên và sử dụng</button>
        </div>
    `;
    
    dialog.innerHTML = html;
    document.body.appendChild(dialog);
    
    // Load available songs
    loadAvailableSongs();
}

// Make functions globally available
window.showMusicSelectorDialog = showMusicSelectorDialog;
window.closeMusicSelector = closeMusicSelector;
window.uploadCustomMusic = uploadCustomMusic;

// Load available songs from playlist
function loadAvailableSongs() {
    // Try to load playlist.json
    fetch('playlist.json')
        .then(response => response.json())
        .then(playlist => {
            console.log('Loaded playlist:', playlist);
            populateSongList('loveSongs', playlist.love_songs || []);
            populateSongList('birthdaySongs', playlist.birthday_songs || []);
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            // Fallback to hardcoded songs
            populateSongList('loveSongs', [
                { title: "Anh Là Của Em", file: "anh_la_cua_em.mp4" },
                { title: "Yêu Là Tha Thu", file: "yeu_la_tha_thu.mp4" }
            ]);
            populateSongList('birthdaySongs', [
                { title: "Chúc Mừng Sinh Nhật", file: "chuc_mung_sinh_nhat.mp4" }
            ]);
        });
}

// Populate song list
function populateSongList(containerId, songs) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    songs.forEach(function(song, index) {
        var songBtn = document.createElement('button');
        songBtn.style.cssText = `
            display: block;
            width: 100%;
            margin: 5px 0;
            padding: 8px 12px;
            background: rgba(255, 107, 157, 0.2);
            border: 1px solid rgba(255, 107, 157, 0.5);
            color: white;
            border-radius: 5px;
            cursor: pointer;
            text-align: left;
            font-size: 14px;
        `;
        songBtn.innerHTML = `🎵 ${song.title}`;
        songBtn.onclick = function() {
            selectSong('songs/' + song.file, song.title);
        };
        
        // Add hover effect
        songBtn.onmouseover = function() {
            this.style.background = 'rgba(255, 107, 157, 0.4)';
        };
        songBtn.onmouseout = function() {
            this.style.background = 'rgba(255, 107, 157, 0.2)';
        };
        
        container.appendChild(songBtn);
    });
}

// Select a song
function selectSong(songPath, songTitle) {
    console.log('Selected song:', songPath, songTitle);
    
    var audio = document.getElementById('galaxyAudio');
    audio.src = songPath;
    audio.load();
    
    // Update galaxy data
    galaxyData.song = songPath;
    
    // Update music button
    var musicBtn = document.getElementById('musicControlBtn');
    document.getElementById('musicIcon').innerHTML = '🎵';
    document.getElementById('musicText').innerHTML = 'Phát nhạc';
    musicBtn.onclick = toggleMusic;
    
    // Close selector dialog
    closeMusicSelector();
    
    // Initialize audio controls
    createAudioControls();
    
    // Show success message
    showNotification(`✓ Đã chọn: ${songTitle}`);
}

// Upload custom music
function uploadCustomMusic() {
    var fileInput = document.getElementById('uploadMusicInput');
    if (!fileInput.files[0]) {
        showNotification('Vui lòng chọn file nhạc!', true);
        return;
    }
    
    var file = fileInput.files[0];
    var audioUrl = URL.createObjectURL(file);
    
    selectSong(audioUrl, file.name);
    showNotification(`✓ Đã tải lên: ${file.name}`);
}

// Close music selector
function closeMusicSelector() {
    var dialog = document.getElementById('musicSelectorDialog');
    if (dialog) dialog.remove();
}

// Show notification
function showNotification(message, isError = false) {
    var notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? 'rgba(220, 53, 69, 0.9)' : 'rgba(67, 255, 107, 0.9)'};
        color: white;
        padding: 10px 15px;
        border-radius: 10px;
        z-index: 1004;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Create audio controls for user
function createAudioControls(hasError) {
    var audio = document.getElementById('galaxyAudio');
    var musicBtn = document.getElementById('musicControlBtn');
    
    console.log('Creating audio controls:', {
        hasError: hasError,
        audioExists: !!audio,
        audioSrc: audio ? audio.src : 'none',
        musicBtnExists: !!musicBtn
    });
    
    // Show the music control button
    if (musicBtn) {
        musicBtn.style.display = 'flex';
        console.log('Music button displayed');
        
        if (hasError) {
            musicBtn.classList.add('error');
            document.getElementById('musicIcon').innerHTML = '🔇';
            document.getElementById('musicText').innerHTML = 'Lỗi phát nhạc';
        } else {
            musicBtn.classList.remove('error');
            document.getElementById('musicIcon').innerHTML = '🎵';
            document.getElementById('musicText').innerHTML = 'Phát nhạc';
            
            // Update button state based on audio state
            audio.addEventListener('play', function() {
                musicBtn.classList.add('playing');
                document.getElementById('musicIcon').innerHTML = '🎶';
                document.getElementById('musicText').innerHTML = 'Đang phát';
                console.log('Audio started playing - button updated');
            });
            
            audio.addEventListener('pause', function() {
                musicBtn.classList.remove('playing');
                document.getElementById('musicIcon').innerHTML = '🎵';
                document.getElementById('musicText').innerHTML = 'Phát nhạc';
                console.log('Audio paused - button updated');
            });
        }
    } else {
        console.error('Music button not found!');
    }
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
    
    // Lọc ra những ảnh hợp lệ
    const validImages = galaxyData.images.filter(img => {
        return img && img.trim() && (img.startsWith('data:image/') || img.startsWith('http'));
    });
    
    if (validImages.length === 0) return;
    
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
    img.src = validImages[Math.floor(Math.random() * validImages.length)];
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
    
    // Handle image load error
    img.onerror = function() {
        console.warn('Failed to load image:', img.src);
        if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
        activeParticles.delete(wrapper);
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

// --- Music Control Functions ---
function toggleMusic() {
    var audio = document.getElementById('galaxyAudio');
    var musicBtn = document.getElementById('musicControlBtn');
    var musicIcon = document.getElementById('musicIcon');
    var musicText = document.getElementById('musicText');
    
    if (!audio || !audio.src) {
        console.error('No audio source available');
        return;
    }
    
    if (audio.paused) {
        // Play music
        audio.muted = false; // Unmute when user clicks
        audio.play().then(function() {
            console.log('Music started playing');
            if (musicBtn) musicBtn.classList.add('playing');
            if (musicIcon) musicIcon.textContent = '🔊';
            if (musicText) musicText.textContent = 'Dừng nhạc';
        }).catch(function(error) {
            console.error('Error playing music:', error);
            if (musicBtn) musicBtn.classList.add('error');
            if (musicIcon) musicIcon.textContent = '❌';
            if (musicText) musicText.textContent = 'Lỗi phát nhạc';
        });
    } else {
        // Pause music
        audio.pause();
        console.log('Music paused');
        if (musicBtn) musicBtn.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🎵';
        if (musicText) musicText.textContent = 'Phát nhạc';
    }
}

function closeHelpAndStartMusic() {
    // Close help popup
    var helpPopup = document.getElementById('helpPopup');
    if (helpPopup) {
        helpPopup.style.display = 'none';
    }
    
    // Auto-start music if available
    var audio = document.getElementById('galaxyAudio');
    if (audio && audio.src) {
        audio.muted = false; // Unmute when user interacts
        audio.play().then(function() {
            console.log('Music auto-started after popup close');
            var musicBtn = document.getElementById('musicControlBtn');
            var musicIcon = document.getElementById('musicIcon');
            var musicText = document.getElementById('musicText');
            
            if (musicBtn) musicBtn.classList.add('playing');
            if (musicIcon) musicIcon.textContent = '🔊';
            if (musicText) musicText.textContent = 'Dừng nhạc';
        }).catch(function(error) {
            console.error('Error auto-starting music:', error);
        });
    }
}

// --- Init ---
loadGalaxyData();