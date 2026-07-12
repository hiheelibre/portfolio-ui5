@echo off
chcp 65001 > nul

echo ========================================
echo  TAESAN ERP Portal Code Deploy
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 현재 변경사항 확인
git status

echo.
echo [2/5] 로컬 빌드 테스트 실행
echo Notion 모듈 동기화 + 게시글 동기화 + 컨텐츠 검증 + UI5 빌드를 실행합니다.
echo.

call npm run portfolio:build

if errorlevel 1 (
    echo.
    echo [ERROR] 로컬 빌드 실패
    echo 코드를 수정한 뒤 다시 실행하세요.
    pause
    exit /b 1
)

echo.
echo [3/5] Git 변경사항 추가
git add .

echo.
echo [보안 확인] .env 파일이 커밋 대상에 들어갔는지 확인합니다.
git diff --cached --name-only | findstr /i "^.env$" > nul

if not errorlevel 1 (
    echo.
    echo [ERROR] .env 파일이 커밋 대상에 포함되었습니다.
    echo .env는 절대 GitHub에 올리면 안 됩니다.
    echo .gitignore에 .env가 있는지 확인하세요.
    pause
    exit /b 1
)

echo.
echo [4/5] 커밋 메시지를 입력하세요.
set /p COMMIT_MSG=Commit message 입력: 

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update ERP portal site
)

echo.
echo 커밋 메시지: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo.
    echo [INFO] 커밋할 변경사항이 없거나 커밋 중 오류가 발생했습니다.
    pause
    exit /b 1
)

echo.
echo [5/5] GitHub로 push
git push

if errorlevel 1 (
    echo.
    echo [ERROR] Git push 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo  완료!
echo  GitHub push 성공.
echo  Netlify가 자동으로 재배포를 시작합니다.
echo ========================================
echo.

timeout /t 2 /nobreak > nul
exit /b 0