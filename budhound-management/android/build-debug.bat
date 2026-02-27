@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
cd /d "c:\BudStore\budhound-management\android"
call "c:\BudStore\budhound-management\android\gradlew.bat" assembleDebug
