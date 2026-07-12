@echo off
chcp 65001 > nul

echo ========================================
echo  TAESAN ERP Portfolio Content Check
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Notion 모듈 데이터 동기화 중...
call npm run notion:modules

if errorlevel 1 (
    echo.
    echo [ERROR] Notion 모듈 동기화 실패
    pause
    exit /b 1
)

echo.
echo [2/3] Notion 게시글 데이터 동기화 중...
call npm run notion:sync

if errorlevel 1 (
    echo.
    echo [ERROR] Notion 게시글 동기화 실패
    pause
    exit /b 1
)

echo.
echo [3/3] 컨텐츠 검증 중...
call npm run content:validate

if errorlevel 1 (
    echo.
    echo [ERROR] 컨텐츠 검증 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo  완료! Notion 데이터와 컨텐츠 검증 성공
echo ========================================
echo.

timeout /t 2 /nobreak > nul
exit /b 0