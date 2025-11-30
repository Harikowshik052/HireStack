@echo off
echo ==========================================
echo  Quick Deployment to Vercel
echo ==========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/4] Checking Git repository...
if not exist .git (
    echo Initializing Git repository...
    git init
    git branch -M main
    echo Git initialized!
) else (
    echo Git repository exists.
)
echo.

echo [2/4] Adding files to Git...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Production ready - Careers customization platform"
if %ERRORLEVEL% NEQ 0 (
    echo No changes to commit or commit failed.
)
echo.

echo [4/4] Next steps:
echo.
echo 1. Create a repository on GitHub: https://github.com/new
echo 2. Run this command (replace with your repo URL):
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git push -u origin main
echo.
echo 3. Go to Vercel: https://vercel.com/new
echo 4. Import your GitHub repository
echo 5. Add environment variables (see DEPLOYMENT.md)
echo 6. Click Deploy!
echo.
echo For detailed instructions, see DEPLOYMENT.md
echo.
pause
