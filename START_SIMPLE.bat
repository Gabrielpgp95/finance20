@echo off
cls
echo ============================================
echo        SIMPLE SYNC - SAME WIFI ONLY
echo ============================================
echo.
echo Starting server...
cd /d "%~dp0"
python sync_server.py
