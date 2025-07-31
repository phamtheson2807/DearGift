#!/bin/bash
# Script tự động tải nhạc từ YouTube cho DearGift
# Sử dụng: ./download-music.sh

echo "🎵 DearGift Music Downloader"
echo "=============================="

# Kiểm tra yt-dlp
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp chưa được cài đặt"
    echo "📦 Cài đặt: pip install yt-dlp"
    exit 1
fi

# Danh sách nhạc cần tải (YouTube URLs)
declare -A songs=(
    ["anh_la_cua_em"]="https://www.youtube.com/watch?v=SEARCH_FOR_COVER"
    ["yeu_la_tha_thu"]="https://www.youtube.com/watch?v=SEARCH_FOR_COVER"
    ["em_cua_ngay_hom_qua"]="https://www.youtube.com/watch?v=SEARCH_FOR_COVER"
)

# Tạo folder songs nếu chưa có
mkdir -p ./songs

echo "🔄 Bắt đầu tải nhạc..."

for filename in "${!songs[@]}"; do
    url="${songs[$filename]}"
    echo "⬇️  Tải: $filename"
    
    # Tải và convert sang MP3
    yt-dlp -x --audio-format mp3 \
           --audio-quality 5 \
           --output "./songs/$filename.%(ext)s" \
           "$url"
    
    if [ $? -eq 0 ]; then
        echo "✅ Thành công: $filename.mp3"
    else
        echo "❌ Lỗi: Không thể tải $filename"
    fi
done

echo ""
echo "🎉 Hoàn thành!"
echo "📁 File nhạc được lưu trong folder: ./songs/"
echo "🔧 Tiếp theo: Cập nhật URL trong playlist.json"
