@echo off
chcp 65001 > nul

echo ========================================
echo  TAESAN ERP Portfolio Deploy
echo ========================================
echo.

cd /d "%~dp0"

echo Netlify 재배포 요청 중...
call npm run notion:deploy

if errorlevel 1 (
    echo.
    echo [ERROR] Netlify 재배포 요청 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo  완료! Netlify 재배포 요청 성공
echo  Netlify Deploys 화면에서 진행 상태를 확인하세요.
echo ========================================
echo.

timeout /t 2 /nobreak > nul
exit /b 0