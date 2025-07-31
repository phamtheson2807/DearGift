import { drawHeartPattern, createHeartQR, createSimpleQR } from './qr.js';
import { uploadImageToR2, uploadAudioToR2 } from './upload.js';

let vouchers = [];
let selectedVoucher = null;
let finalTotal = 0; // Biến lưu số tiền tổng sau khi áp dụng voucher

async function createProduct(product) {
    try {
        const res = await fetch('https://dearlove-backend.onrender.com/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const data = await res.json();
        if (data.success) {
            console.log('Tạo sản phẩm thành công:', data.data);
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        throw new Error('Lỗi khi tạo sản phẩm: ' + error.message);
    }
}

function validateForm() {
    const messages = document.getElementById('messages').value.trim();
    const customIcons = document.getElementById('customIcons').value.trim();
    const images = document.getElementById('images').files;
    const tipAmount = Number(document.getElementById('tipAmount').value) || 0;
    const customSongFile = document.getElementById('customSongFile').files[0];

    if (!messages) {
        alert('Vui lòng nhập ít nhất một tin nhắn!');
        return false;
    }

    if (customIcons && !customIcons.split(',').every(icon => icon.trim())) {
        alert('Biểu tượng tùy chỉnh không hợp lệ! Vui lòng nhập các biểu tượng hợp lệ, cách nhau bởi dấu phẩy.');
        return false;
    }

    if (customSongFile && customSongFile.size > 10 * 1024 * 1024) {
        alert('File âm thanh vượt quá 10MB!');
        return false;
    }

    if (images.length > 5) {
        alert('Bạn chỉ có thể chọn tối đa 5 ảnh!');
        return false;
    }

    if (tipAmount < 0) {
        alert('Số tiền tip không thể âm!');
        return false;
    }

    return true;
}


function updateTotalAmount() {
    let total = 0;
    const imagesInput = document.getElementById('images');
    const customSongFile = document.getElementById('customSongFile').files[0];

    if (imagesInput.files.length > 0) total += 15000;
    if (document.getElementById('isHeart').checked) total += 10000;
    if (document.getElementById('isSave').checked) total += 20000;

    // --- Cộng thêm 7k nếu có chọn file âm thanh ---
    if (customSongFile) total += 7000;

    const originalTotal = total; // Lưu số tiền gốc

    if (selectedVoucher) {
        total = total - Math.round(total * selectedVoucher.discountValue / 100);
    }

    const tip = Number(document.getElementById('tipAmount').value) || 0;
    total += tip;
    finalTotal = total; // Cập nhật finalTotal cho UI

    const totalAmountDiv = document.getElementById('totalAmount');
    if (selectedVoucher) {
        totalAmountDiv.innerHTML = `Tổng tiền: <span style="color:#e53935;">${total.toLocaleString('vi-VN')}₫</span> <span style="font-size:14px;color:#888;">(đã áp dụng voucher${tip > 0 ? `, tip ${tip.toLocaleString('vi-VN')}₫` : ''})</span>`;
    } else {
        totalAmountDiv.innerHTML = `Tổng tiền: <span style="color:#6c63ff;">${total.toLocaleString('vi-VN')}₫</span>${tip > 0 ? ` <span style="font-size:14px;color:#888;">(tip ${tip.toLocaleString('vi-VN')}₫)</span>` : ''}`;
    }
    document.getElementById('donateMsg').style.display = total > 0 ? '' : 'none';
}

function showThankDialog(isPaid) {
    const thankDialog = document.createElement('div');
    thankDialog.id = 'thankDialog';
    thankDialog.innerHTML = `
        <div class="thank-dialog-overlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;">
            <div class="thank-dialog-box" style="position:relative;z-index:2;">
                <div class="thank-dialog-message">
                    <h4>Xong rùi đó!</h4>
                    <br>
                    ${isPaid ? `
                        chúng tôi sẽ trích ra một phần số tiền trong hoạt động dự án lần này để ủng hộ cho các bạn nhỏ có hoàn cảnh khó khăn ở vùng sâu vùng xa. các hoạt động này mình sẽ công khai trên kênh tiktok của mình nhé.
                    ` : `
                        Mình bỏ ra một ngày để làm nên hãy follow 
                        <a href="https://www.tiktok.com/@iamtritoan?is_from_webapp=1&sender_device=pc" target="_blank">tiktok</a>
                        mình để mình có thêm động lực nhé!
                        <br>
                        Nếu bạn muốn website hoạt động lâu dài thì có thể donate cho mình một chút ít để mình có phí trả tiền server hosting cho mọi người nhaaa.
                        <br>
                        Donate bằng cách ấn vào nút 💖 ở góc phải ạ.
                    `}
                    <br>Cảm ơn bạn. Chúc bạn có một ngày thật tuyệt vời 💗
                </div>
                <button id="closeThankDialog" class="thank-dialog-button">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(thankDialog);

    const closeDialog = () => thankDialog.remove();
    document.getElementById('closeThankDialog').onclick = closeDialog;
    thankDialog.querySelector('.thank-dialog-overlay').onclick = function (e) {
        if (e.target === this) closeDialog();
    };
    setTimeout(() => {
        if (document.body.contains(thankDialog)) closeDialog();
    }, 6000);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const originalBtnText = submitBtn.innerHTML;
    const customSongFile = document.getElementById('customSongFile').files[0];
    const imagesInput = document.getElementById('images');

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Đang tạo...';
    loading.style.display = 'block';
    result.style.display = 'none';


    try {
        // Tính toán số tiền thanh toán TRƯỚC KHI áp dụng voucher
        let paymentAmount = 0;


        if (imagesInput.files.length > 0) paymentAmount += 15000;
        if (document.getElementById('isHeart').checked) paymentAmount += 10000;
        if (document.getElementById('isSave').checked) paymentAmount += 20000;
        const tip = Number(document.getElementById('tipAmount').value) || 0;

        // --- Cộng thêm 7k nếu có chọn file âm thanh ---
        if (customSongFile) paymentAmount += 7000;

        // Số tiền gốc (chưa áp dụng voucher)
        const originalAmount = paymentAmount;

        // Cộng tip vào cuối
        paymentAmount += tip;
        finalTotal = paymentAmount; // Cập nhật finalTotal

        const messages = document.getElementById('messages').value.split('\n').filter(msg => msg.trim()).map(msg => msg.trim());
        const customIcons = document.getElementById('customIcons').value.trim();
        const isSaveChecked = document.getElementById('isSave').checked;
        const isHeartChecked = document.getElementById('isHeart').checked;
        const textHeart = isHeartChecked ? document.getElementById('textHeart').value.trim() : '';
        const songSelect = document.getElementById('song');


        let icons = JSON.parse(document.querySelector('.icon-option.selected')?.dataset.icons || '["♥", "💖", "💕", "💗"]');
        if (customIcons) {
            icons = customIcons.split(',').map(i => i.trim()).filter(i => i);
        }

        const prefix = isSaveChecked ? 'vip' : '';

        let songUrl = '';
        if (customSongFile) {
            songUrl = await uploadAudioToR2(customSongFile, prefix);
        } else if (songSelect.value) {
            songUrl = `songs/${songSelect.value}`;
        }

        const galaxyData = {
            messages,
            icons,
            colors: document.getElementById('colorMain').value,
            isHeart: isHeartChecked,
            textHeart,
            isSave: isSaveChecked,
            song: songUrl,
            images: [],
            createdAt: new Date().toISOString()
        };

        let imageUrls = [];
        if (imagesInput.files.length > 0) {
            const uploadPromises = Array.from(imagesInput.files).slice(0, 5).map(async file => {
                // Đọc file thành base64
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                return await uploadImageToR2(base64, prefix);
            });
            imageUrls = await Promise.all(uploadPromises);
        }
        galaxyData.images = imageUrls;

        const userUid = localStorage.getItem('user_uid');

        // Bước 1: Tạo galaxy trước
        const response = await fetch('https://dearlove-backend.onrender.com/api/galaxies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(galaxyData)
        });

        if (!response.ok) throw new Error('Lỗi khi tạo galaxy');
        const data = await response.json();
        const galaxyId = data.data?._id;
        if (!galaxyId) throw new Error('Không lấy được ID galaxy');

        const galaxyUrl = `${window.location.origin}/galaxy-viewer.html?id=${galaxyId}`;
        
        // Bước 2: Tạo orderCode unique (số đầu 1-9 + timestamp cuối + random)
        const firstDigit = Math.floor(1 + Math.random() * 9); // Số từ 1-9
        const orderCode = firstDigit.toString() + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);

        // Bước 3: Tạo product với status phù hợp
        const product = {
            uid: userUid,
            orderCode: orderCode.toString(),
            name: 'Galaxy Yêu Thương',
            type: 'Galaxy',
            price: finalTotal,
            images: finalTotal > 0 ? 'https://res.cloudinary.com/dtcyfyauk/image/upload/v1750332180/Screenshot_2025-06-16_225325_rrlzdm.png' : '',
            linkproduct: galaxyUrl,
            configId: galaxyId,
            status: finalTotal > 0 ? 'PENDING' : 'FREE',
            createdAt: new Date()
        };
        
        await createProduct(product);

        // Bước 4: Áp dụng voucher nếu có (cho cả FREE và PENDING)
        if (selectedVoucher) {
            try {
                showToast && showToast('Đang áp dụng voucher...', 'info');
                const voucherRes = await fetch('https://dearlove-backend.onrender.com/api/vouchers/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        uid: userUid, 
                        code: selectedVoucher.code,
                        orderCode: orderCode.toString()
                    })
                });
                const voucherData = await voucherRes.json();
                if (!voucherData.success) {
                    showToast && showToast(voucherData.message || 'Áp dụng voucher thất bại!', 'error');
                    // Voucher failed, product status đã được update thành PENDING ở backend
                } else {
                    showToast && showToast('Áp dụng voucher thành công!', 'success');
                }
            } catch (err) {
                showToast && showToast('Lỗi khi áp dụng voucher!', 'error');
                // Continue to payment even if voucher fails
            }
        }

        // Bước 5: Xử lý thanh toán hoặc hiển thị kết quả
        if (finalTotal > 0) {
            const paymentData = {
                amount: finalTotal,
                description: "galaxy",
                orderCode: Number(orderCode),
                uid: userUid, 
                customerEmail:localStorage.getItem('user_email'),
            };

            const res = await fetch('https://dearlove-backend.onrender.com/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            console.log('Payment response:', paymentData);
            const resultData = await res.json();
            if (!resultData.data?.checkoutUrl) {
                throw new Error('Không nhận được URL thanh toán');
            }

            document.getElementById('paymentIframe').src = resultData.data.checkoutUrl;
            document.getElementById('paymentModal').style.display = 'block';

            const paymentModalCloseBtn = document.querySelector('#paymentModal button');
            const restoreButton = () => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                loading.style.display = 'none';
            };
            paymentModalCloseBtn.onclick = () => {
                document.getElementById('paymentModal').style.display = 'none';
                restoreButton();
            };

            return new Promise(resolve => {
                window.addEventListener('message', async function handler(event) {
                    if (event.data?.type === 'paymentSuccess') {
                        document.getElementById('paymentModal').style.display = 'none';
                        paymentModalCloseBtn.onclick = null;

                        // Thanh toán thành công, hiển thị kết quả
                        loading.style.display = 'none';
                        result.style.display = 'block';
                        document.getElementById('resultLink').textContent = galaxyUrl;
                        document.getElementById('viewBtn').href = galaxyUrl;

                        document.getElementById('copyBtn').onclick = () => {
                            navigator.clipboard.writeText(galaxyUrl).then(() => {
                                const copyBtn = document.getElementById('copyBtn');
                                copyBtn.textContent = '✅ Đã copy!';
                                setTimeout(() => copyBtn.textContent = '📋 Copy Link', 2000);
                            });
                        };

                        document.getElementById('heartQRBtn').onclick = () => {
                            window.location.href = `heartqr.html?qr=${encodeURIComponent(galaxyUrl)}`;
                        };

                        await createHeartQR(galaxyUrl);
                        showThankDialog(true);
                        window.removeEventListener('message', handler);
                        resolve();
                    }
                });
            });
        } else {
            // Trường hợp miễn phí (finalTotal = 0)
            console.log('Galaxy miễn phí, hiển thị kết quả');
            
            loading.style.display = 'none';
            result.style.display = 'block';
            document.getElementById('resultLink').textContent = galaxyUrl;
            document.getElementById('viewBtn').href = galaxyUrl;

            document.getElementById('copyBtn').onclick = () => {
                navigator.clipboard.writeText(galaxyUrl).then(() => {
                    const copyBtn = document.getElementById('copyBtn');
                    copyBtn.textContent = '✅ Đã copy!';
                    setTimeout(() => copyBtn.textContent = '📋 Copy Link', 2000);
                });
            };

            document.getElementById('heartQRBtn').onclick = () => {
                window.location.href = `heartqr.html?qr=${encodeURIComponent(galaxyUrl)}`;
            };

            await createHeartQR(galaxyUrl);
            showThankDialog(false);
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Đã xảy ra lỗi: ' + error.message);
        submitBtn.innerHTML = originalBtnText;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        loading.style.display = 'none';
    }
}

function initEventListeners() {
    document.getElementById('donateBtn').onclick = () => {
        document.getElementById('donateDialog').style.display = 'flex';
    };

    document.getElementById('closeDonateDialog').onclick = () => {
        document.getElementById('donateDialog').style.display = 'none';
    };

    document.getElementById('copyBankNumber').onclick = () => {
        navigator.clipboard.writeText('12508248888').then(() => {
            const copySuccessMsg = document.getElementById('copySuccessMsg');
            copySuccessMsg.style.display = 'inline';
            setTimeout(() => copySuccessMsg.style.display = 'none', 1500);
        });
    };

    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            document.getElementById('customIcons').value = '';
        });
    });

    document.getElementById('customIcons').addEventListener('input', () => {
        if (document.getElementById('customIcons').value.trim()) {
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        }
    });

    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('change', (e) => {
            e.target.parentElement.querySelector('.color-preview').style.background = e.target.value;
        });
    });

    const songSelect = document.getElementById('song');
    const customSongFile = document.getElementById('customSongFile');
    const customSongAudio = document.getElementById('customSongAudio');
    const previewDefaultSongBtn = document.getElementById('previewDefaultSongBtn');
    const songFileMsg = document.getElementById('songFileMsg');

    songSelect.addEventListener('change', () => {
        if (songSelect.value) {
            customSongFile.value = '';
            customSongAudio.style.display = 'none';
            customSongAudio.pause();
            updateTotalAmount(); // <-- Thêm dòng này để cập nhật lại tổng tiền
        }
    });

    customSongFile.addEventListener('change', () => {
        songFileMsg.style.display = 'none';
        customSongAudio.style.display = 'none';
        customSongAudio.src = '';
        songSelect.value = '';
        const file = customSongFile.files[0];
        if (file) {
            // Chặn file mp4
            if (file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')) {
                songFileMsg.textContent = 'Không hỗ trợ file mp4! Vui lòng chọn file âm thanh (.mp3, .ogg, .wav)';
                songFileMsg.style.display = '';
                customSongFile.value = '';
                updateTotalAmount();
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                songFileMsg.textContent = 'File âm thanh vượt quá 10MB!';
                songFileMsg.style.display = '';
                customSongFile.value = '';
                updateTotalAmount();
                return;
            }
            customSongAudio.src = URL.createObjectURL(file);
            customSongAudio.style.display = 'block';
        }
        updateTotalAmount();
    });

    previewDefaultSongBtn.addEventListener('click', () => {
        const selectedSong = songSelect.value;
        if (!selectedSong) {
            alert('Vui lòng chọn một bài hát có sẵn!');
            return;
        }
        customSongAudio.pause();
        customSongAudio.src = `songs/${selectedSong}`;
        customSongAudio.load();
        customSongAudio.style.display = 'block';
        customSongAudio.play().catch(() => {
            // alert('Không phát được file nhạc này!');
        });
    });

    const imagesInput = document.getElementById('images');
    const imagePreview = document.getElementById('imagePreview');
    imagesInput.addEventListener('change', () => {
        imagePreview.innerHTML = '';
        Array.from(imagesInput.files).slice(0, 5).forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            imagePreview.appendChild(img);
        });
        updateTotalAmount();
    });

    const isHeartCheckbox = document.getElementById('isHeart');
    const textHeartInput = document.getElementById('textHeart');
    isHeartCheckbox.addEventListener('change', () => {
        textHeartInput.style.display = isHeartCheckbox.checked ? 'block' : 'none';
        updateTotalAmount();
    });

    document.getElementById('isSave').addEventListener('change', updateTotalAmount);
    document.getElementById('tipAmount').addEventListener('input', updateTotalAmount);
}

document.getElementById('galaxyForm').addEventListener('submit', handleFormSubmit);
document.addEventListener('DOMContentLoaded', initEventListeners);
updateTotalAmount();

async function loadUserVouchers() {
    const voucherList = document.getElementById('voucherList');
    const voucherResult = document.getElementById('voucherResult');
    vouchers = [];
    selectedVoucher = null;
    if (!voucherList) return;
    voucherList.innerHTML = 'Đang tải voucher...';
    voucherResult.style.display = 'none';
    const uid = localStorage.getItem('user_uid');
    if (!uid) {
        voucherList.innerHTML = '<span style="color:#e53935;">Bạn cần đăng nhập để xem voucher!</span>';
        return;
    }
    try {
        const res = await fetch(`https://dearlove-backend.onrender.com/api/vouchers/saved/${uid}`);
        const data = await res.json();
        if (!data.success) {
            voucherList.innerHTML = `<span style="color:#e53935;">${data.message}</span>`;
            return;
        }
        if (!data.data.length) {
            voucherList.innerHTML = '<span style="color:#888;">Bạn không có voucher nào cả!</span>';
            return;
        }
        vouchers = data.data;
        voucherList.innerHTML = vouchers.map((v, idx) => `
            <div class="voucher-item" data-idx="${idx}">
                <input class="voucher-checkbox" type="checkbox" name="voucher" id="voucher_${idx}">
                <label for="voucher_${idx}">
                    <b>${v.code}</b> - Giảm: ${v.discountValue}% | HSD: ${new Date(v.expiredAt).toLocaleDateString()}
                </label>
            </div>
        `).join('');
        selectedVoucher = null;
        updateTotalAmount();
    } catch (err) {
        voucherList.innerHTML = '<span style="color:#e53935;">Không thể tải voucher!</span>';
        console.error('Lỗi khi lấy voucher:', err);
    }
}

const voucherList = document.getElementById('voucherList');
if (voucherList) {
    voucherList.addEventListener('change', (e) => {
        if (e.target.name === 'voucher') {
            const checkboxes = voucherList.querySelectorAll('input[name="voucher"]');
            const idx = Array.from(checkboxes).findIndex(cb => cb === e.target);

            if (e.target.checked) {
                checkboxes.forEach((cb, i) => cb.checked = i === idx);
                selectedVoucher = vouchers[idx];
            } else {
                selectedVoucher = null;
            }
            updateTotalAmount();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserVouchers();
    initEventListeners();
    updateTotalAmount();
});

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = 9999;
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.background = type === 'error' ? '#e53935' : (type === 'success' ? '#43a047' : '#333');
    toast.style.color = '#fff';
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = '0 2px 12px #0002';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ...existing code...

function showLoginRequiredDialog() {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <div style="
            position:fixed;top:0;left:0;width:100vw;height:100vh;
            background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="
                background:#fff;padding:32px 28px 20px 28px;border-radius:16px;
                box-shadow:0 4px 24px #0002;max-width:340px;width:90%;text-align:center;position:relative;">
                <h3 style="color:#e53935;margin-bottom:12px;">Bạn cần đăng nhập</h3>
                <div style="color:#444;margin-bottom:18px;">Vui lòng đăng nhập để sử dụng chức năng này!</div>
                <button id="loginDialogBtn" style="
                    background:#4ecdc4;color:#fff;padding:8px 24px;border:none;
                    border-radius:8px;font-weight:bold;cursor:pointer;font-size:1rem;">
                    Đăng nhập ngay
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    document.getElementById('loginDialogBtn').onclick = function() {
        window.location.href = 'deargift.html';
    };
}

// Kiểm tra đăng nhập ngay khi load trang
const uid = localStorage.getItem('user_uid');
if (!uid) {
    showLoginRequiredDialog();
}