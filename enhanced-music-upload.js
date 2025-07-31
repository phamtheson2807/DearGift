/**
 * Enhanced Music Upload with multiple fallbacks
 * Supports Dropbox, Firebase, and Local blob URLs
 */

window.enhancedMusicUpload = async function(file, onProgress) {
    console.log('Starting enhanced music upload for:', file.name);
    
    // Try upload methods in order of preference
    const uploadMethods = [
        {
            name: 'Dropbox',
            handler: () => window.uploadMusicToDropbox(file, onProgress)
        },
        {
            name: 'Firebase',
            handler: () => window.uploadMusicAndGetUrl ? window.uploadMusicAndGetUrl(file, onProgress) : null
        },
        {
            name: 'Local Blob',
            handler: () => createLocalBlobUrl(file, onProgress)
        }
    ];
    
    for (const method of uploadMethods) {
        try {
            if (onProgress) onProgress(0, `Thử upload với ${method.name}...`);
            
            if (!method.handler) {
                console.log(`${method.name} handler not available, skipping...`);
                continue;
            }
            
            const result = await method.handler();
            
            if (result && result.success) {
                console.log(`Upload successful with ${method.name}:`, result.url);
                
                if (onProgress) onProgress(100, `✅ Upload thành công với ${method.name}`);
                
                return {
                    success: true,
                    url: result.url,
                    method: method.name,
                    filename: result.filename || file.name
                };
            }
            
        } catch (error) {
            console.warn(`${method.name} upload failed:`, error.message);
            
            if (onProgress) onProgress(0, `${method.name} thất bại, thử phương pháp khác...`);
            
            // Continue to next method
            continue;
        }
    }
    
    // All methods failed
    if (onProgress) onProgress(0, '❌ Tất cả phương pháp upload đều thất bại');
    
    throw new Error('All upload methods failed');
};

/**
 * Create local blob URL as final fallback
 */
function createLocalBlobUrl(file, onProgress) {
    return new Promise((resolve) => {
        try {
            if (onProgress) onProgress(50, 'Tạo URL tạm thời...');
            
            const blobUrl = URL.createObjectURL(file);
            
            if (onProgress) onProgress(100, 'Tạo URL tạm thời thành công');
            
            resolve({
                success: true,
                url: blobUrl,
                filename: file.name,
                isLocal: true,
                warning: 'URL tạm thời - chỉ hoạt động trong phiên này'
            });
            
        } catch (error) {
            resolve({
                success: false,
                error: error.message
            });
        }
    });
}

/**
 * Updated music upload handler with enhanced fallback
 */
window.handleEnhancedMusicUpload = async function(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    console.log('Starting enhanced music upload process...');
    
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
        // Try enhanced upload with fallbacks
        const result = await window.enhancedMusicUpload(file, onProgress);
        
        if (result.success) {
            // Store the URL globally
            window.uploadedMusicUrl = result.url;
            window.uploadedMusicFilename = result.filename;
            
            // Show success message
            let successMessage = `✅ ${result.method}: ${result.filename}`;
            if (result.warning) {
                successMessage += ` ⚠️ ${result.warning}`;
            }
            
            statusDiv.innerHTML = successMessage;
            statusDiv.style.color = result.method === 'Local Blob' ? '#ff9800' : '#4ecdc4';
            
            // Show preview button
            previewContainer.style.display = 'block';
            previewBtn.onclick = () => {
                window.previewMusic(result.url, result.filename);
            };
            
            console.log(`Music upload successful with ${result.method}:`, result.url);
            
        } else {
            throw new Error('Upload failed');
        }
        
    } catch (error) {
        console.error('Enhanced upload error:', error);
        statusDiv.innerHTML = `❌ Upload thất bại: ${error.message}`;
        statusDiv.style.color = '#ff6b9d';
    }
};
