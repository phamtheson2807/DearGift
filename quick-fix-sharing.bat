@echo off
title DearGift - Quick Fix & Test Tool
echo ===========================================
echo DearGift - Quick Fix & Test Tool
echo ===========================================
echo.

:menu
echo Chon mot thao tac:
echo 1. Mo trang Test Sharing
echo 2. Mo Creator page
echo 3. Mo Home page  
echo 4. Kiem tra cac file quan trong
echo 5. Chay server backend (neu co)
echo 6. Xem log loi gan day
echo 7. Backup du lieu
echo 8. Thoat
echo.
set /p choice="Nhap lua chon (1-8): "

if "%choice%"=="1" goto test_sharing
if "%choice%"=="2" goto open_creator
if "%choice%"=="3" goto open_home
if "%choice%"=="4" goto check_files
if "%choice%"=="5" goto run_backend
if "%choice%"=="6" goto show_logs
if "%choice%"=="7" goto backup
if "%choice%"=="8" goto exit
goto menu

:test_sharing
echo Mo trang Test Sharing...
start "" "test-sharing.html"
goto menu

:open_creator
echo Mo trang Creator...
start "" "creator.html"
goto menu

:open_home
echo Mo trang Home...
start "" "index.html"
goto menu

:check_files
echo ===========================================
echo Kiem tra cac file quan trong...
echo ===========================================

if exist "index.html" (
    echo [OK] index.html - Tim thay
) else (
    echo [ERROR] index.html - KHONG tim thay
)

if exist "creator.html" (
    echo [OK] creator.html - Tim thay
) else (
    echo [ERROR] creator.html - KHONG tim thay
)

if exist "creator.js" (
    echo [OK] creator.js - Tim thay
) else (
    echo [ERROR] creator.js - KHONG tim thay
)

if exist "galaxy-viewer.js" (
    echo [OK] galaxy-viewer.js - Tim thay
) else (
    echo [ERROR] galaxy-viewer.js - KHONG tim thay
)

if exist "test-sharing.html" (
    echo [OK] test-sharing.html - Tim thay
) else (
    echo [ERROR] test-sharing.html - KHONG tim thay
)

if exist "clipboard-helper.js" (
    echo [OK] clipboard-helper.js - Tim thay
) else (
    echo [ERROR] clipboard-helper.js - KHONG tim thay
)

if exist "songs\" (
    echo [OK] Folder songs/ - Tim thay
    dir songs\*.mp3 songs\*.webm songs\*.mp4 2>nul | find /c ".mp" > temp_count.txt
    set /p song_count=<temp_count.txt
    del temp_count.txt
    echo [INFO] Co %song_count% file nhac
) else (
    echo [ERROR] Folder songs/ - KHONG tim thay
)

if exist "backend\" (
    echo [OK] Folder backend/ - Tim thay
    if exist "backend\server.js" (
        echo [OK] Backend server.js - Tim thay
    ) else (
        echo [WARNING] Backend server.js - KHONG tim thay
    )
) else (
    echo [WARNING] Folder backend/ - KHONG tim thay
)

echo.
pause
goto menu

:run_backend
echo ===========================================
echo Chay server backend...
echo ===========================================

if exist "backend\server.js" (
    echo Dang chuyen den folder backend...
    cd backend
    echo Cai dat dependencies...
    call npm install
    echo Chay server...
    call npm start
    cd ..
) else (
    echo [ERROR] Khong tim thay backend server!
    echo Ban co muon tai backend moi khong? (y/n)
    set /p download_backend=""
    if /i "%download_backend%"=="y" (
        echo Vui long tao backend bang tay hoac dung tools khac
    )
)

echo.
pause
goto menu

:show_logs
echo ===========================================
echo Cac loi thuong gap va cach sua:
echo ===========================================
echo.
echo 1. "Truy cap link bao koong tim thay website"
echo    - Nguyen nhan: Link chua localhost hoac blob URL
echo    - Cach sua: Dung domain production https://deargift.netlify.app
echo.
echo 2. "Nhac khong phat duoc khi chia se"  
echo    - Nguyen nhan: File nhac dung Blob URL
echo    - Cach sua: Dung nhac co san hoac nhap URL nhac online
echo.
echo 3. "Galaxy hien thi trong"
echo    - Nguyen nhan: Sai ID hoac du lieu khong ton tai
echo    - Cach sua: Kiem tra ID trong URL va localStorage
echo.
echo 4. "Khong sao chep duoc link"
echo    - Nguyen nhan: Trinh duyet khong ho tro clipboard API
echo    - Cach sua: Sao chep bang tay hoac dung trinh duyet khac
echo.
pause
goto menu

:backup
echo ===========================================
echo Backup du lieu...
echo ===========================================

set backup_folder=backup_%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
set backup_folder=%backup_folder: =0%
mkdir "%backup_folder%" 2>nul

echo Sao chep cac file quan trong...
copy "*.html" "%backup_folder%\" >nul 2>&1
copy "*.js" "%backup_folder%\" >nul 2>&1
copy "*.css" "%backup_folder%\" >nul 2>&1
copy "*.md" "%backup_folder%\" >nul 2>&1
copy "*.json" "%backup_folder%\" >nul 2>&1

if exist "songs\" (
    mkdir "%backup_folder%\songs" 2>nul
    xcopy "songs\*" "%backup_folder%\songs\" /e /i >nul 2>&1
)

if exist "backend\" (
    mkdir "%backup_folder%\backend" 2>nul  
    xcopy "backend\*" "%backup_folder%\backend\" /e /i >nul 2>&1
)

echo Backup thanh cong tai folder: %backup_folder%
echo.
pause
goto menu

:exit
echo Cam on ban da su dung DearGift Quick Fix Tool!
echo Website: https://deargift.netlify.app
pause
exit

echo.
echo ===========================================
echo Script loi hoac bi gian doan
echo ===========================================
pause
