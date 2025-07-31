// Firebase Storage Manager for Music Upload
class FirebaseMusicUploader {
    constructor() {
        this.storage = null;
        this.isInitialized = false;
        // Don't initialize immediately, wait for explicit call
    }

    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        try {
            console.log('Starting Firebase Storage initialization...');
            
            // Wait for Firebase to be loaded and initialized
            await this.waitForFirebase();
            
            // Use the existing Firebase app instance
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                this.storage = firebase.storage();
                this.isInitialized = true;
                console.log('Firebase Storage initialized for music uploads using existing app');
                return true;
            } else {
                throw new Error('Firebase app not initialized');
            }
        } catch (error) {
            console.error('Failed to initialize Firebase Storage:', error);
            this.isInitialized = false;
            return false;
        }
    }

    waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds max wait
            
            const checkFirebase = () => {
                attempts++;
                
                // Check if Firebase is initialized with app
                if (typeof firebase !== 'undefined' && 
                    firebase.apps && 
                    firebase.apps.length > 0 && 
                    firebase.storage) {
                    console.log('Firebase detected and ready');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('Firebase check failed after', attempts, 'attempts');
                    console.log('Firebase status:', {
                        firebaseExists: typeof firebase !== 'undefined',
                        appsLength: firebase && firebase.apps ? firebase.apps.length : 'undefined',
                        storageExists: firebase && firebase.storage ? 'exists' : 'undefined'
                    });
                    reject(new Error('Firebase not loaded after 10 seconds'));
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
        });
    }

    async uploadMusic(file, progressCallback = null) {
        // Ensure initialized before upload
        if (!this.isInitialized) {
            console.log('Initializing Firebase Storage before upload...');
            const success = await this.initialize();
            if (!success) {
                throw new Error('Failed to initialize Firebase Storage');
            }
        }

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const fileExtension = file.name.split('.').pop();
            const uniqueFileName = `music_${timestamp}_${randomId}.${fileExtension}`;
            
            // Create storage reference
            const storageRef = this.storage.ref();
            const musicRef = storageRef.child(`music/${uniqueFileName}`);
            
            console.log('Starting upload to Firebase Storage:', uniqueFileName);
            
            // Start upload with progress monitoring
            const uploadTask = musicRef.put(file);
            
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    // Progress function
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress.toFixed(2) + '%');
                        
                        if (progressCallback) {
                            progressCallback(progress);
                        }
                    },
                    // Error function
                    (error) => {
                        console.error('Upload error:', error);
                        reject(error);
                    },
                    // Complete function
                    async () => {
                        try {
                            console.log('Upload completed successfully');
                            
                            // Get download URL
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('Download URL obtained:', downloadURL);
                            
                            const uploadResult = {
                                originalName: file.name,
                                fileName: uniqueFileName,
                                downloadURL: downloadURL,
                                size: file.size,
                                type: file.type,
                                uploadedAt: new Date().toISOString(),
                                storageRef: `music/${uniqueFileName}`
                            };
                            
                            resolve(uploadResult);
                        } catch (error) {
                            console.error('Error getting download URL:', error);
                            reject(error);
                        }
                    }
                );
            });
            
        } catch (error) {
            console.error('Error starting upload:', error);
            throw error;
        }
    }

    async deleteMusic(storageRef) {
        if (!this.isInitialized) {
            throw new Error('Firebase Storage not initialized');
        }

        try {
            const fileRef = this.storage.ref(storageRef);
            await fileRef.delete();
            console.log('Music file deleted from Firebase Storage:', storageRef);
            return true;
        } catch (error) {
            console.error('Error deleting music file:', error);
            throw error;
        }
    }

    // Validate music file
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
}

// Don't create global instance immediately
// Instead, export the class and create instance when needed
window.FirebaseMusicUploader = FirebaseMusicUploader;

// Function to initialize uploader when Firebase is ready
window.initializeFirebaseMusicUploader = async function() {
    if (!window.firebaseMusicUploader) {
        console.log('Creating Firebase Music Uploader...');
        window.firebaseMusicUploader = new FirebaseMusicUploader();
        
        // Initialize it
        const success = await window.firebaseMusicUploader.initialize();
        if (success) {
            console.log('Firebase Music Uploader ready');
        } else {
            console.error('Firebase Music Uploader initialization failed');
        }
    }
    return window.firebaseMusicUploader;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseMusicUploader;
}
