@echo off
echo ============================================
echo   PLANNER SYNC SERVER - PUBLIC ACCESS
echo ============================================
echo.
echo Your Local IP: 192.168.0.237
echo Server Port: 8080
echo.
echo Access URLs:
echo   Desktop: http://localhost:8080/index.html
echo   Same WiFi: http://192.168.0.237:8080/index.html
echo   Public: http://YOUR-PUBLIC-IP:8080/index.html
echo.
echo To find your PUBLIC IP, visit: https://whatismyipaddress.com
echo.
echo ============================================
echo Starting server...
echo ============================================
echo.

cd /d "%~dp0"
python sync_server.py

pause
