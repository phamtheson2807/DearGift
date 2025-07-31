@echo off
REM Windows batch script để tải nhạc cho DearGift
REM Sử dụng: download-music.bat

echo 🎵 DearGift Music Downloader (Windows)
echo ======================================

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

echo 🔄 Bắt đầu tải nhạc...

echo ⬇️  Tải: Anh Là Của Em (Cover)
yt-dlp -x --audio-format mp3 --audio-quality 5 --output "songs/anh_la_cua_em.%%(ext)s" "https://www.youtube.com/watch?v=6vBCPcvC_Js"

echo ⬇️  Tải: Yêu Là Tha Thu (Cover)
yt-dlp -x --audio-format mp3 --audio-quality 5 --output "songs/yeu_la_tha_thu.%%(ext)s" "https://www.youtube.com/watch?v=IxCD2j6T-H4"

echo ⬇️  Tải: Có Chàng Trai Viết Lên Cây (Piano Cover)
yt-dlp -x --audio-format mp3 --audio-quality 5 --output "songs/co_chang_trai_viet_len_cay.%%(ext)s" "https://www.youtube.com/watch?v=q7giKJc2pM8"

echo ⬇️  Tải: Chúc Mừng Sinh Nhật (Traditional / Instrumental)
yt-dlp -x --audio-format mp3 --audio-quality 5 --output "songs/chuc_mung_sinh_nhat.%%(ext)s" "https://www.youtube.com/watch?v=hW8c1y2xsa0"

echo.
echo 🎉 Hoàn thành!
echo 📁 File nhạc được lưu trong folder: .\songs\
echo 🔧 Tiếp theo: Cập nhật URL trong playlist.json
pause
