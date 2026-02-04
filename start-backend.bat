@echo off
echo ============================================================
echo Starting BioSync Pro Professional Backend Server (VENV)
echo ============================================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Setting up Virtual Environment (one-time setup)...
if not exist "backend\venv" (
    python -m venv backend\venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment. 
        echo Trying to proceed without it...
    )
)

echo.
echo Activating environment and installing dependencies...
call backend\venv\Scripts\activate
python -m pip install --upgrade pip --quiet
python -m pip install -r backend/requirements.txt --quiet

if errorlevel 1 (
    echo WARNING: Dependency installation had some issues.
    echo Trying to start the server anyway...
)

echo.
echo Starting backend server (ZK Protocol Port 4370)...
echo Press Ctrl+C to stop the server
echo.

cd backend
python proxy_server.py

pause
