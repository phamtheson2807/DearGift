// Hàm sao chép vào clipboard an toàn
function copyToClipboard(text, successCallback, errorCallback) {
  try {
    // Kiểm tra URL trước khi sao chép
    if (text && (text.includes('localhost') || text.includes('127.0.0.1') || text.includes('file:') || text.startsWith('blob:'))) {
      console.warn("⚠️ CẢNH BÁO: Link này sẽ không hoạt động khi chia sẻ vì chứa URL local!", text);
      // Hiển thị cảnh báo nhưng vẫn tiến hành sao chép
      showToast("⚠️ CẢNH BÁO: Link này có thể không hoạt động khi chia sẻ vì chứa URL local!", "warning", 8000);
    }
    
    // Sử dụng navigator.clipboard API (hiện đại hơn) nếu có
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (successCallback) successCallback();
          else showToast("✅ Đã sao chép vào clipboard");
        })
        .catch(err => {
          console.error("Navigator clipboard failed:", err);
          // Fallback to old method
          fallbackCopy(text);
        });
    } else {
      // Fallback to old method for older browsers
      fallbackCopy(text);
    }
  } catch (e) {
    console.error("Error copying to clipboard:", e);
    if (errorCallback) errorCallback(e);
    else showToast("❌ Không thể sao chép: " + e.message, "error");
  }
  
  // Phương pháp sao chép phụ
  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // Tránh cuộn trang
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        if (successCallback) successCallback();
        else showToast("✅ Đã sao chép vào clipboard (phương pháp cũ)");
      } else {
        throw new Error("Lệnh execCommand không thành công");
      }
    } catch (err) {
      console.error("Fallback clipboard copy failed:", err);
      if (errorCallback) errorCallback(err);
      else showToast("❌ Không thể sao chép: " + err.message, "error");
    }
    
    document.body.removeChild(textArea);
  }
}
