@echo off
REM Simplified download script - downloads as original format first
REM Then we can convert separately

echo 🎵 DearGift Music Downloader (Simplified)
echo ==========================================

REM Kiểm tra yt-dlp
where yt-dlp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ yt-dlp chưa được cài đặt
    echo 📦 Cài đặt: pip install yt-dlp
    pause
    exit /b 1
)

REM Tạo folder songs
if not exist "songs" mkdir songs

echo 🔄 Bắt đầu tải nhạc (format gốc)...

echo ⬇️  Tải: Anh Là Của Em (Cover)
yt-dlp --output "songs/anh_la_cua_em.%%(ext)s" "https://www.youtube.com/watch?v=6vBCPcvC_Js"

echo ⬇️  Tải: Yêu Là Tha Thu (Cover)
yt-dlp --output "songs/yeu_la_tha_thu.%%(ext)s" "https://www.youtube.com/watch?v=IxCD2j6T-H4"

echo ⬇️  Tải: Có Chàng Trai Viết Lên Cây (Piano Cover)
yt-dlp --output "songs/co_chang_trai_viet_len_cay.%%(ext)s" "https://www.youtube.com/watch?v=q7giKJc2pM8"

echo ⬇️  Tải: Chúc Mừng Sinh Nhật (Traditional)
yt-dlp --output "songs/chuc_mung_sinh_nhat.%%(ext)s" "https://www.youtube.com/watch?v=hW8c1y2xsa0"

echo ⬇️  Tải: Piano Nhẹ Nhàng
yt-dlp --output "songs/piano_nhe_nhang.%%(ext)s" "https://www.youtube.com/watch?v=jfKfPfyJRdk"

echo.
echo 🎉 Hoàn thành tải về!
echo 📁 File được lưu trong: .\songs\
echo 🔧 Các file có thể ở định dạng .webm hoặc .m4a
echo 💡 Có thể convert sang MP3 bằng VLC hoặc online converter
echo.
dir songs
pause
