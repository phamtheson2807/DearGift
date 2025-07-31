// Safari Detection and Compatibility Check
(function() {
    'use strict';
    
    // Detect Safari
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var safariVersion = null;
    
    if (isSafari || isiOS) {
        var match = navigator.userAgent.match(/Version\/(\d+)/);
        safariVersion = match ? parseInt(match[1]) : null;
        
        console.log('Safari/iOS detected. Version:', safariVersion);
        
        // Check for very old Safari versions
        if (safariVersion && safariVersion < 10) {
            // Show compatibility warning for very old Safari
            var warning = document.createElement('div');
            warning.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff6b9d;color:white;padding:10px;text-align:center;z-index:10000;font-family:Arial,sans-serif;font-size:14px;';
            warning.innerHTML = '⚠️ Trình duyệt Safari của bạn có thể quá cũ. Vui lòng cập nhật để có trải nghiệm tốt nhất! <button onclick="this.parentNode.remove()" style="margin-left:10px;background:white;color:#ff6b9d;border:none;padding:5px 10px;border-radius:3px;">Đóng</button>';
            document.body.appendChild(warning);
        }
        
        // Specific iOS Safari fixes
        if (isiOS) {
            // Prevent bounce scrolling
            document.addEventListener('touchmove', function(e) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Fix viewport height on iOS
            function updateViewportHeight() {
                var vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
            }
            
            window.addEventListener('resize', updateViewportHeight);
            window.addEventListener('orientationchange', function() {
                setTimeout(updateViewportHeight, 100);
            });
            
            // Initial call
            updateViewportHeight();
            
            // Fix audio playback on iOS
            var audioFixed = false;
            function fixAudio() {
                if (!audioFixed) {
                    var audio = document.querySelector('audio');
                    if (audio) {
                        audio.muted = false;
                        audio.play().catch(function() {
                            // Audio play failed, but that's okay
                        });
                    }
                    audioFixed = true;
                }
            }
            
            document.addEventListener('touchstart', fixAudio, { once: true });
            document.addEventListener('click', fixAudio, { once: true });
        }
    }
    
    // Check for required features and provide fallbacks
    var missingFeatures = [];
    
    if (!window.URLSearchParams) {
        missingFeatures.push('URLSearchParams');
    }
    
    if (!window.Promise) {
        missingFeatures.push('Promise');
    }
    
    if (!window.Set) {
        missingFeatures.push('Set');
    }
    
    if (missingFeatures.length > 0) {
        console.warn('Missing features detected:', missingFeatures);
        console.log('Polyfills should handle these automatically.');
    }
    
})();
