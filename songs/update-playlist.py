# Script Python để cập nhật playlist.json với file thực
import json
import os
import glob

def update_playlist_with_real_files():
    """Cập nhật playlist.json với file nhạc thực đã tải"""
    
    # Đọc playlist hiện tại
    with open('playlist.json', 'r', encoding='utf-8') as f:
        playlist = json.load(f)
    
    # Mapping file names với playlist entries
    file_mappings = {
        'anh_la_cua_em': 'love1',
        'yeu_la_tha_thu': 'love2', 
        'co_chang_trai_viet_len_cay': 'love4',
        'chuc_mung_sinh_nhat': 'birthday1',
        'piano_nhe_nhang': 'inst1'
    }
    
    # Tìm các file đã tải
    downloaded_files = {}
    for pattern in ['*.webm', '*.m4a', '*.mp4', '*.mp3']:
        for file_path in glob.glob(f'songs/{pattern}'):
            filename = os.path.splitext(os.path.basename(file_path))[0]
            downloaded_files[filename] = file_path
    
    print("📁 Files found:")
    for filename, path in downloaded_files.items():
        print(f"  - {filename}: {path}")
    
    # Cập nhật URLs trong playlist
    updated = False
    
    # Update love_songs
    for song in playlist['love_songs']:
        for file_key, song_id in file_mappings.items():
            if song['id'] == song_id and file_key in downloaded_files:
                old_url = song['url']
                song['url'] = f"./{downloaded_files[file_key]}"
                print(f"✅ Updated {song['name']}: {old_url} -> {song['url']}")
                updated = True
    
    # Update birthday_songs
    for song in playlist['birthday_songs']:
        for file_key, song_id in file_mappings.items():
            if song['id'] == song_id and file_key in downloaded_files:
                old_url = song['url']
                song['url'] = f"./{downloaded_files[file_key]}"
                print(f"✅ Updated {song['name']}: {old_url} -> {song['url']}")
                updated = True
    
    # Update instrumental
    for song in playlist['instrumental']:
        for file_key, song_id in file_mappings.items():
            if song['id'] == song_id and file_key in downloaded_files:
                old_url = song['url']
                song['url'] = f"./{downloaded_files[file_key]}"
                print(f"✅ Updated {song['name']}: {old_url} -> {song['url']}")
                updated = True
    
    if updated:
        # Lưu playlist đã cập nhật
        with open('playlist.json', 'w', encoding='utf-8') as f:
            json.dump(playlist, f, ensure_ascii=False, indent=2)
        print("\n🎉 Playlist updated successfully!")
    else:
        print("\n⚠️  No matching files found to update")
    
    return playlist

if __name__ == "__main__":
    update_playlist_with_real_files()
