// Music Upload Handler for DearGift
// This simulates file upload functionality for development

class MusicUploadManager {
    constructor() {
        this.uploadedFiles = new Map(); // Store uploaded files temporarily
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = [
            'audio/mpeg', 'audio/wav', 'audio/ogg', 
            'audio/mp4', 'audio/m4a', 'audio/webm'
        ];
    }

    // Simulate file upload to server
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            // Validate file
            if (!this.validateFile(file)) {
                reject(new Error('Invalid file'));
                return;
            }

            // Create unique filename
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const fileExtension = file.name.split('.').pop();
            const uniqueFilename = `uploaded_${timestamp}_${randomId}.${fileExtension}`;

            // Simulate upload delay
            setTimeout(() => {
                // Create blob URL for immediate use
                const blobUrl = URL.createObjectURL(file);
                
                // Store file info
                const fileInfo = {
                    id: uniqueFilename,
                    originalName: file.name,
                    uniqueName: uniqueFilename,
                    blobUrl: blobUrl,
                    serverUrl: `./songs/uploads/${uniqueFilename}`, // Simulated server path
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                };

                this.uploadedFiles.set(uniqueFilename, fileInfo);
                
                // In real implementation, this would be the server response
                resolve({
                    success: true,
                    fileId: uniqueFilename,
                    url: fileInfo.serverUrl,
                    blobUrl: fileInfo.blobUrl,
                    message: 'File uploaded successfully'
                });
            }, 1000); // Simulate 1 second upload time
        });
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            alert(`File quá lớn! Kích thước tối đa: ${this.maxFileSize / 1024 / 1024}MB`);
            return false;
        }

        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            alert('Định dạng file không được hỗ trợ! Chỉ chấp nhận: MP3, WAV, OGG, MP4, M4A, WebM');
            return false;
        }

        return true;
    }

    // Get uploaded file info
    getFileInfo(fileId) {
        return this.uploadedFiles.get(fileId);
    }

    // Clean up blob URLs to prevent memory leaks
    cleanup(fileId) {
        const fileInfo = this.uploadedFiles.get(fileId);
        if (fileInfo && fileInfo.blobUrl) {
            URL.revokeObjectURL(fileInfo.blobUrl);
        }
        this.uploadedFiles.delete(fileId);
    }

    // Get all uploaded files
    getAllFiles() {
        return Array.from(this.uploadedFiles.values());
    }
}

// Create global instance
window.musicUploadManager = new MusicUploadManager();

// Enhanced upload handler for creator.js
async function handleAdvancedMusicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadStatus = document.getElementById('uploadStatus') || createUploadStatus();
    
    try {
        // Show uploading status
        uploadStatus.innerHTML = '⏳ Đang tải lên...';
        uploadStatus.style.color = '#ffa500';
        
        // Upload file
        const result = await window.musicUploadManager.uploadFile(file);
        
        if (result.success) {
            // Store upload result globally
            window.uploadedMusicFile = {
                fileId: result.fileId,
                url: result.url,
                blobUrl: result.blobUrl,
                originalName: file.name,
                size: file.size
            };
            
            // Clear preset selection
            window.selectedSong = null;
            const allSongItems = document.querySelectorAll('.song-item');
            allSongItems.forEach(item => item.classList.remove('selected'));
            
            // Show success
            uploadStatus.innerHTML = `✅ Đã tải lên: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
            uploadStatus.style.color = '#4CAF50';
            
            console.log('Music uploaded successfully:', result);
        }
    } catch (error) {
        uploadStatus.innerHTML = `❌ Lỗi: ${error.message}`;
        uploadStatus.style.color = '#ff4444';
        console.error('Upload error:', error);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MusicUploadManager, handleAdvancedMusicUpload };
}
