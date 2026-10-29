@echo off
title PSB Auto Curing Dashboard
cd /d "%~dp0"
if not exist dist\index.html (
  echo Building dashboard for the first time...
  call npm run build
)
echo.
echo  TV screen : http://localhost:8080/
echo  Admin     : http://localhost:8080/#admin
echo  Keep this window open. Close it to stop the dashboard.
echo.
python server.py %*
pause

