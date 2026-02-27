@echo off
setlocal

:: ─── Config ───────────────────────────────────────────────────────
set "PROJECT_DIR=c:\BudStore\budhound-management"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"
set "APK=%PROJECT_DIR%\android\app\build\outputs\apk\debug\app-debug.apk"
set "PACKAGE=com.budhound.management"
set "ACTIVITY=%PACKAGE%/.MainActivity"

set "USERNAME=storeowner"
set "PASSWORD=password"

:: ─── Step 1: Build React app for Android ──────────────────────────
echo.
echo [1/6] Building React app (Vite --mode android)...
cd /d "%PROJECT_DIR%"
call npx vite build --mode android
if errorlevel 1 (
    echo ERROR: Vite build failed.
    exit /b 1
)

:: ─── Step 2: Sync to Capacitor Android ────────────────────────────
echo.
echo [2/6] Syncing Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed.
    exit /b 1
)

:: ─── Step 3: Build debug APK ──────────────────────────────────────
echo.
echo [3/6] Building debug APK (Gradle)...
cd /d "%PROJECT_DIR%\android"
call "%PROJECT_DIR%\android\gradlew.bat" assembleDebug
if errorlevel 1 (
    echo ERROR: Gradle build failed.
    exit /b 1
)

:: ─── Step 4: Install APK on emulator ──────────────────────────────
echo.
echo [4/6] Installing APK...
"%ADB%" install -r "%APK%"
if errorlevel 1 (
    echo ERROR: APK install failed. Is the emulator running?
    exit /b 1
)

:: ─── Step 5: Launch app ───────────────────────────────────────────
echo.
echo [5/6] Launching BudHound...
"%ADB%" shell am force-stop %PACKAGE%
timeout /t 1 /nobreak >nul
"%ADB%" shell am start -n %ACTIVITY%

:: Wait for app to fully load
echo Waiting for app to load...
timeout /t 6 /nobreak >nul

:: ─── Step 6: Automate login ───────────────────────────────────────
echo.
echo [6/6] Logging in as %USERNAME%...

:: Tap username field (from uiautomator: bounds [126,1015][952,1128])
"%ADB%" shell input tap 539 1072
timeout /t 1 /nobreak >nul

:: Type username
"%ADB%" shell input text %USERNAME%
timeout /t 1 /nobreak >nul

:: Tap password field (from uiautomator: bounds [126,1241][952,1351])
"%ADB%" shell input tap 539 1296
timeout /t 1 /nobreak >nul

:: Type password
"%ADB%" shell input text %PASSWORD%
timeout /t 1 /nobreak >nul

:: Hide keyboard
"%ADB%" shell input keyevent 4
timeout /t 1 /nobreak >nul

:: Tap Sign In button (from uiautomator: bounds [126,1401][952,1509])
"%ADB%" shell input tap 539 1455

echo.
echo Done! BudHound should be logging in now.
endlocal
