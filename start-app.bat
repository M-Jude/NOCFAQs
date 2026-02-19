@echo off
echo Starting NOC FAQs Application...
echo.

REM Start backend server in a new window
echo Starting Backend Server on port 5000...
start "NOC FAQs Backend" cmd /k "cd /d %~dp0backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting Frontend on port 3000...
start "NOC FAQs Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
