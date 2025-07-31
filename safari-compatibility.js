// Safari Compatibility Polyfills
(function() {
    'use strict';
    
    console.log('Loading Safari compatibility polyfills...');
    
    // Polyfill for URLSearchParams (Safari < 10.1)
    if (!window.URLSearchParams) {
        console.log('Adding URLSearchParams polyfill');
        window.URLSearchParams = function(search) {
            var self = this;
            this.params = {};
            
            if (search) {
                search = search.replace(/^\?/, '');
                if (search) {
                    var pairs = search.split('&');
                    pairs.forEach(function(pair) {
                        var parts = pair.split('=');
                        var key = decodeURIComponent(parts[0]);
                        var value = parts[1] ? decodeURIComponent(parts[1]) : '';
                        self.params[key] = value;
                    });
                }
            }
            
            this.get = function(key) {
                return this.params[key] || null;
            };
            
            this.has = function(key) {
                return key in this.params;
            };
        };
    }
    
    // Polyfill for Promise (Safari < 7.1)
    if (!window.Promise) {
        window.Promise = function(executor) {
            var self = this;
            this.state = 'pending';
            this.value = undefined;
            this.handlers = [];
            
            function resolve(result) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = result;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function reject(error) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = error;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function handle(handler) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }
            
            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(result) {
                            try {
                                resolve(onFulfilled ? onFulfilled(result) : result);
                            } catch (error) {
                                reject(error);
                            }
                        },
                        onRejected: function(error) {
                            try {
                                resolve(onRejected ? onRejected(error) : error);
                            } catch (err) {
                                reject(err);
                            }
                        }
                    });
                });
            };
            
            executor(resolve, reject);
        };
    }
    
    // Add Set polyfill for Safari < 7.1
    if (!window.Set) {
        window.Set = function() {
            this._values = [];
            
            this.add = function(value) {
                if (this._values.indexOf(value) === -1) {
                    this._values.push(value);
                }
                return this;
            };
            
            this.has = function(value) {
                return this._values.indexOf(value) !== -1;
            };
            
            this.delete = function(value) {
                var index = this._values.indexOf(value);
                if (index !== -1) {
                    this._values.splice(index, 1);
                    return true;
                }
                return false;
            };
            
            this.clear = function() {
                this._values = [];
            };
            
            Object.defineProperty(this, 'size', {
                get: function() {
                    return this._values.length;
                }
            });
        };
    }
    
    // Fix iOS Safari viewport issues
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        // Prevent zoom on double tap
        var lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Fix iOS Safari 100vh issue
        function setViewportHeight() {
            var vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        }
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', function() {
            setTimeout(setViewportHeight, 100);
        });
    }
    
    // Ensure audio context is resumed for Safari
    if (window.AudioContext || window.webkitAudioContext) {
        window.resumeAudioContext = function() {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!window.audioContext) {
                window.audioContext = new AudioContext();
            }
            if (window.audioContext.state === 'suspended') {
                window.audioContext.resume();
            }
        };
    }
    
})();
