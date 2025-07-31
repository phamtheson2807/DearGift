@echo off
echo Deploying Firebase Storage rules...

REM Install Firebase CLI if not already installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Login to Firebase (if not already logged in)
echo Checking Firebase login...
firebase login

REM Deploy storage rules
echo Deploying storage rules...
firebase deploy --only storage

echo.
echo Storage rules deployed successfully!
echo Music files can now be uploaded to Firebase Storage.
echo.
pause
