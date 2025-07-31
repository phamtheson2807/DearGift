export function drawHeartPattern(canvas, size) {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const dotSize = 2;
    const gap = 1;
    const step = dotSize + gap;

    for (let layer = 0; layer < 3; layer++) {
        const scale = 0.8 + layer * 0.4;
        for (let x = 0; x < size; x += step) {
            for (let y = 0; y < size; y += step) {
                const centerX = size / 2;
                const centerY = size / 2;
                const relX = (x - centerX) / (size * 0.3 * scale);
                const relY = (y - centerY) / (size * 0.3 * scale);
                const heartEq = Math.pow(relX * relX + relY * relY - 1, 3) - relX * relX * Math.pow(relY, 3);
                const distFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
                const isInHeartShape = heartEq <= 0;
                const isNotInCenter = distFromCenter > size * 0.2;

                if (isInHeartShape && isNotInCenter) {
                    const opacity = (0.15 + layer * 0.05) * (distFromCenter / (size * 0.4));
                    const colors = ['#ff6b9d', '#4ecdc4', '#ffd93d'];
                    ctx.fillStyle = colors[layer] + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                    if (Math.random() > 0.4 - layer * 0.1) {
                        ctx.fillRect(x, y, dotSize, dotSize);
                    }
                }
            }
        }
    }
}

export async function createHeartQR(galaxyUrl) {
    if (typeof QRCodeStyling === 'undefined') {
        console.error('QRCodeStyling chưa được load!');
        return createSimpleQR(galaxyUrl);
    }

    const qrDiv = document.getElementById('qrCode');
    qrDiv.innerHTML = '';

    const qrContainer = document.createElement('div');
    qrContainer.style.position = 'relative';
    qrContainer.style.display = 'inline-block';
    qrContainer.style.background = 'white';
    qrContainer.style.padding = '20px';
    qrContainer.style.borderRadius = '25px';
    qrContainer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

    const heartCanvas = document.createElement('canvas');
    heartCanvas.style.position = 'absolute';
    heartCanvas.style.top = '0';
    heartCanvas.style.left = '0';
    heartCanvas.style.zIndex = '1';
    heartCanvas.style.pointerEvents = 'none';

    const qrCodeDiv = document.createElement('div');
    qrCodeDiv.style.position = 'relative';
    qrCodeDiv.style.zIndex = '2';

    try {
        const qrCode = new QRCodeStyling({
            width: 200,
            height: 200,
            data: galaxyUrl,
            image: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png",
            dotsOptions: { color: "#ff6b9d", type: "rounded" },
            backgroundOptions: { color: "rgba(255, 255, 255, 0.9)" },
            imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.2 },
            cornersSquareOptions: { color: "#ff6b9d", type: "extra-rounded" },
            cornersDotOptions: { color: "#ff6b9d", type: "dot" }
        });

        drawHeartPattern(heartCanvas, 240);
        qrContainer.appendChild(heartCanvas);
        qrContainer.appendChild(qrCodeDiv);
        qrDiv.appendChild(qrContainer);
        qrCode.append(qrCodeDiv);
    } catch (error) {
        console.error('Lỗi tạo QR fancy:', error);
        createSimpleQR(galaxyUrl);
    }
}

export function createSimpleQR(galaxyUrl) {
    const qrDiv = document.getElementById('qrCode');
    qrDiv.innerHTML = `
        <div style="padding: 20px; background: white; border-radius: 15px; color: #333;">
            <p><strong>Link Galaxy của bạn:</strong></p>
            <div style="word-break: break-all; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0;">
                ${galaxyUrl}
            </div>
            <p><em>QR Code sẽ hiển thị sau khi thư viện load xong</em></p>
        </div>
    `;
    setTimeout(() => {
        if (typeof QRCodeStyling !== 'undefined') {
            createHeartQR(galaxyUrl);
        }
    }, 2000);
}