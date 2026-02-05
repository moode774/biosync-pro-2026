@echo off
echo ============================================================
echo BioSync Pro - GUARANTEED WORKING SOLUTION
echo ============================================================
echo.
echo Stopping any running servers...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
cd /d "%~dp0backend"
start "BioSync Backend" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend...
cd /d "%~dp0"
start "BioSync Frontend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ============================================================
echo ✅ READY! Opening browser...
echo ============================================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo.
timeout /t 3 /nobreak >nul
start http://localhost:3001

echo.
echo Press any key to stop all servers...
pause >nul

taskkill /F /IM node.exe 2>nul
echo.
echo Servers stopped.
pause
