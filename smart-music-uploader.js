// Smart Music Upload Manager - Firebase + Blob Fallback
class SmartMusicUploader {
    constructor() {
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.firebaseUploader = null;
        this.firebaseDisabled = false; // Flag to disable Firebase after CORS issues
        this.initializeUploader();
    }

    async initializeUploader() {
        // Always try to use Firebase Storage for permanent links
        try {
            if (window.firebaseMusicUploader) {
                this.firebaseUploader = window.firebaseMusicUploader;
                console.log('Using existing Firebase Storage instance');
            } else if (window.initializeFirebaseMusicUploader) {
                this.firebaseUploader = await window.initializeFirebaseMusicUploader();
                console.log('Initialized Firebase Storage instance');
            }
        } catch (error) {
            console.warn('Firebase Storage not available, will use Blob URLs as fallback:', error);
            this.firebaseDisabled = true;
        }
    }

    async uploadMusic(file, progressCallback = null) {
        try {
            // Validate file first
            this.validateMusicFile(file);
            
            // Check if Firebase is disabled due to previous CORS issues
            if (this.firebaseDisabled) {
                console.log('Firebase Storage disabled due to previous CORS issues, using Blob URL...');
                return await this.uploadAsBlob(file, progressCallback);
            }
            
            // Always try Firebase Storage first for permanent links
            if (this.firebaseUploader && this.firebaseUploader.isInitialized) {
                console.log('Uploading to Firebase Storage for permanent link...');
                try {
                    const result = await this.firebaseUploader.uploadMusic(file, progressCallback);
                    console.log('Firebase upload successful:', result);
                    return result;
                } catch (firebaseError) {
                    console.error('Firebase upload failed:', firebaseError);
                    
                    // Check for CORS or Firebase errors and fallback quickly
                    if (firebaseError.message.includes('CORS') || 
                        firebaseError.message.includes('permission') ||
                        firebaseError.message.includes('auth') ||
                        firebaseError.message.includes('ERR_FAILED') ||
                        firebaseError.message.includes('access control') ||
                        firebaseError.message.includes('preflight') ||
                        firebaseError.message.includes('HTTP ok status') ||
                        firebaseError.message.includes('timeout') ||
                        firebaseError.message.includes('network issue') ||
                        firebaseError.code === 'storage/unauthorized' ||
                        firebaseError.code === 'storage/unknown' ||
                        firebaseError.code === 'storage/invalid-url') {
                        console.log('Firebase/CORS/Network issue detected, disabling Firebase and falling back to Blob URL...');
                        
                        // Disable Firebase for future uploads in this session
                        this.firebaseDisabled = true;
                        
                        return await this.uploadAsBlob(file, progressCallback);
                    } else {
                        throw firebaseError;
                    }
                }
            } else {
                // Firebase not initialized, use Blob URL
                console.log('Firebase not available, using Blob URL...');
                return await this.uploadAsBlob(file, progressCallback);
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    async uploadAsBlob(file, progressCallback = null) {
        return new Promise((resolve) => {
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progressCallback) {
                    progressCallback(progress);
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Create blob URL
                    const blobUrl = URL.createObjectURL(file);
                    
                    const result = {
                        originalName: file.name,
                        fileName: `blob_${Date.now()}_${file.name}`,
                        downloadURL: blobUrl,
                        size: file.size,
                        type: file.type,
                        uploadedAt: new Date().toISOString(),
                        isBlobUpload: true,
                        storageRef: null
                    };
                    
                    console.log('Blob upload completed:', result);
                    resolve(result);
                }
            }, 100);
        });
    }

    validateMusicFile(file) {
        const validTypes = [
            'audio/mpeg',
            'audio/mp3', 
            'audio/mp4',
            'audio/wav',
            'audio/ogg',
            'audio/webm',
            'video/mp4'
        ];
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
            throw new Error(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${validTypes.join(', ')}`);
        }
        
        if (file.size > maxSize) {
            throw new Error('File quá lớn. Kích thước tối đa là 50MB');
        }
        
        return true;
    }

    // Method to check if can upload to Firebase
    async canUseFirebase() {
        if (this.isDevelopment) return false;
        
        try {
            // Test Firebase connection
            const testRef = firebase.storage().ref('test/connection-test.txt');
            const blob = new Blob(['test'], { type: 'text/plain' });
            await testRef.put(blob);
            await testRef.delete();
            return true;
        } catch (error) {
            console.log('Firebase Storage not accessible:', error.message);
            return false;
        }
    }

    // Cleanup blob URLs when not needed
    static cleanupBlobUrl(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
            console.log('Blob URL cleaned up:', url);
        }
    }
}

// Create global instance
window.smartMusicUploader = new SmartMusicUploader();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartMusicUploader;
}
