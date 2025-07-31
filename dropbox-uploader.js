/**
 * Dropbox Music Uploader
 * Tự động upload file nhạc lên Dropbox và trả về link phát nhạc
 */

class DropboxUploader {
    constructor() {
        // Dropbox API configuration
        this.CLIENT_ID = '6lmeeq8njmvmdnf'; // Dropbox App Key
        this.REDIRECT_URI = window.location.origin + window.location.pathname;
        this.accessToken = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Dropbox uploader
     */
    async init() {
        try {
            // Check if we have access token from URL or localStorage
            this.accessToken = this.getAccessTokenFromUrl() || localStorage.getItem('dropbox_access_token');
            
            if (this.accessToken) {
                console.log('Dropbox access token found');
                this.isInitialized = true;
                return true;
            } else {
                console.log('No Dropbox access token found');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Dropbox:', error);
            return false;
        }
    }

    /**
     * Authenticate with Dropbox
     */
    authenticate() {
        const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
            `client_id=${this.CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
            `response_type=token&` +
            `scope=files.content.write files.content.read`;
        
        console.log('Redirecting to Dropbox authentication...');
        window.location.href = authUrl;
    }

    /**
     * Get access token from URL hash
     */
    getAccessTokenFromUrl() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        
        if (token) {
            // Save token to localStorage
            localStorage.setItem('dropbox_access_token', token);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return token;
        }
        
        return null;
    }

    /**
     * Upload file to Dropbox and get sharing link
     */
    async uploadFile(file, onProgress) {
        if (!this.isInitialized) {
            throw new Error('Dropbox not initialized. Please authenticate first.');
        }

        try {
            // Show progress
            if (onProgress) onProgress(0, 'Bắt đầu upload lên Dropbox...');

            // Generate unique filename
            const timestamp = new Date().getTime();
            const filename = `music_${timestamp}_${file.name}`;
            const dropboxPath = `/DearGift/${filename}`;

            // Upload file to Dropbox
            if (onProgress) onProgress(25, 'Đang upload file...');
            
            const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: dropboxPath,
                        mode: 'add',
                        autorename: true,
                        mute: false
                    }),
                    'Content-Type': 'application/octet-stream'
                },
                body: file
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.text();
                throw new Error(`Upload failed: ${error}`);
            }

            const uploadData = await uploadResponse.json();
            console.log('File uploaded successfully:', uploadData);

            if (onProgress) onProgress(75, 'Tạo link chia sẻ...');

            // Create sharing link
            const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: dropboxPath,
                    settings: {
                        requested_visibility: 'public'
                    }
                })
            });

            if (!shareResponse.ok) {
                const error = await shareResponse.text();
                throw new Error(`Failed to create sharing link: ${error}`);
            }

            const shareData = await shareResponse.json();
            console.log('Sharing link created:', shareData);

            // Convert Dropbox sharing URL to direct download URL
            const directUrl = shareData.url.replace('?dl=0', '?dl=1');

            if (onProgress) onProgress(100, 'Upload thành công!');

            return {
                success: true,
                url: directUrl,
                originalUrl: shareData.url,
                filename: filename,
                path: dropboxPath,
                size: file.size,
                type: file.type
            };

        } catch (error) {
            console.error('Dropbox upload error:', error);
            if (onProgress) onProgress(0, `Lỗi upload: ${error.message}`);
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.isInitialized && this.accessToken;
    }

    /**
     * Logout from Dropbox
     */
    logout() {
        localStorage.removeItem('dropbox_access_token');
        this.accessToken = null;
        this.isInitialized = false;
    }

    /**
     * Test connection to Dropbox
     */
    async testConnection() {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Dropbox connection successful:', userData);
                return { 
                    success: true, 
                    user: userData.name.display_name,
                    email: userData.email
                };
            } else {
                return { success: false, error: 'Connection failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Global instance
window.dropboxUploader = new DropboxUploader();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Dropbox uploader...');
    await window.dropboxUploader.init();
});

/**
 * Main function to upload music and get Dropbox URL
 */
window.uploadMusicToDropbox = async function(file, onProgress) {
    console.log('Starting Dropbox music upload for:', file.name);
    
    try {
        // Check if Dropbox is authenticated
        if (!window.dropboxUploader.isAuthenticated()) {
            if (onProgress) onProgress(0, 'Đang xác thực Dropbox...');
            
            // Try to authenticate
            const authSuccess = await window.dropboxUploader.init();
            if (!authSuccess) {
                // Need user authentication
                if (confirm('Cần kết nối với Dropbox để upload nhạc. Bạn có muốn tiếp tục?')) {
                    window.dropboxUploader.authenticate();
                    return { success: false, error: 'Authentication required' };
                } else {
                    throw new Error('Dropbox authentication required');
                }
            }
        }

        // Test connection first
        const connectionTest = await window.dropboxUploader.testConnection();
        if (!connectionTest.success) {
            throw new Error(`Dropbox connection failed: ${connectionTest.error}`);
        }

        if (onProgress) onProgress(5, `Kết nối Dropbox thành công (${connectionTest.user})`);

        // Upload file
        const result = await window.dropboxUploader.uploadFile(file, onProgress);
        
        if (result.success) {
            console.log('Dropbox upload successful:', result);
            
            // Show success notification
            showMusicNotification(`✅ Upload thành công: ${result.filename}`);
            
            return {
                success: true,
                url: result.url,
                filename: result.filename,
                provider: 'dropbox',
                size: result.size
            };
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('Dropbox upload failed:', error);
        
        // Show error notification
        showMusicNotification(`❌ Upload lỗi: ${error.message}`, true);
        
        if (onProgress) onProgress(0, `Lỗi: ${error.message}`);
        
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Enhanced music upload with Dropbox integration
 */
window.handleDropboxMusicUpload = async function(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    console.log('Starting Dropbox music upload process...');
    
    // Get UI elements
    const statusDiv = document.getElementById('musicUploadStatus');
    const previewContainer = document.getElementById('musicPreviewContainer');
    const previewBtn = document.getElementById('previewUploadedMusicBtn');
    
    // Clear previous state
    window.uploadedMusicUrl = null;
    previewContainer.style.display = 'none';
    
    // Validate file
    if (!file.type.startsWith('audio/')) {
        statusDiv.innerHTML = '❌ Vui lòng chọn file âm thanh';
        statusDiv.style.color = '#ff6b9d';
        return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        statusDiv.innerHTML = '❌ File quá lớn (tối đa 50MB)';
        statusDiv.style.color = '#ff6b9d';
        return;
    }
    
    // Progress callback
    const onProgress = (percent, message) => {
        statusDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 100px; height: 4px; background: rgba(255,107,157,0.3); border-radius: 2px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: #ff6b9d; transition: width 0.3s ease;"></div>
                </div>
                <span>${message}</span>
            </div>
        `;
        statusDiv.style.color = percent === 100 ? '#4ecdc4' : '#ff6b9d';
    };
    
    try {
        // Upload to Dropbox
        const result = await window.uploadMusicToDropbox(file, onProgress);
        
        if (result.success) {
            // Store the URL globally
            window.uploadedMusicUrl = result.url;
            window.uploadedMusicFilename = result.filename;
            
            // Show success message
            statusDiv.innerHTML = `✅ Upload thành công: ${result.filename}`;
            statusDiv.style.color = '#4ecdc4';
            
            // Show preview button
            previewContainer.style.display = 'block';
            previewBtn.onclick = () => {
                window.previewMusic(result.url, result.filename);
            };
            
            console.log('Music uploaded to Dropbox successfully:', result.url);
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        statusDiv.innerHTML = `❌ Upload thất bại: ${error.message}`;
        statusDiv.style.color = '#ff6b9d';
    }
};

// Helper function for notifications (if not already defined)
if (!window.showMusicNotification) {
    window.showMusicNotification = function(message, isError = false) {
        const existing = document.getElementById('musicNotification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'musicNotification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${isError ? 'rgba(220, 53, 69, 0.9)' : 'rgba(67, 255, 107, 0.9)'};
            color: white;
            padding: 12px 16px;
            border-radius: 10px;
            z-index: 1005;
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 300px;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; margin-left: 10px;">✖</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    };
}
