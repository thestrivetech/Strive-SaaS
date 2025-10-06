@echo off
REM Windows batch script to update session numbers using PowerShell
REM Usage: update-session-number.bat 3  (sets to Session 3)
REM Usage: update-session-number.bat    (auto-increments by 1)

echo ========================================
echo Session Number Update Script
echo ========================================

REM Check if PowerShell script exists
if not exist "%~dp0update-session-number.ps1" (
    echo ERROR: PowerShell script not found!
    echo Expected: %~dp0update-session-number.ps1
    pause
    exit /b 1
)

REM Run the PowerShell script with the provided argument
if "%1"=="" (
    echo Auto-incrementing session number...
    powershell -ExecutionPolicy Bypass -File "%~dp0update-session-number.ps1"
) else (
    echo Setting session number to: %1
    powershell -ExecutionPolicy Bypass -File "%~dp0update-session-number.ps1" %1
)

pause