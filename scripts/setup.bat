@echo off
echo ==========================================
echo  Careers Page Customization Setup
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [2/6] npm version:
npm --version
echo.

REM Install dependencies
echo [3/6] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

REM Check if .env file exists
if not exist .env (
    echo [4/6] Creating .env file from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo .env file created! Please update it with your database credentials.
        echo.
    ) else (
        echo [WARNING] .env.example not found. Please create .env manually.
        echo.
    )
) else (
    echo [4/6] .env file already exists.
    echo.
)

REM Generate Prisma Client
echo [5/6] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma Client!
    pause
    exit /b 1
)
echo Prisma Client generated successfully!
echo.

REM Push database schema
echo [6/6] Pushing database schema...
echo NOTE: Make sure your database credentials in .env are correct!
echo.
choice /C YN /M "Do you want to push the database schema now"
if %ERRORLEVEL% EQU 1 (
    call npx prisma db push
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to push database schema. You can do this later with: npm run db:push
    ) else (
        echo Database schema pushed successfully!
    )
) else (
    echo Skipping database push. Run 'npm run db:push' when ready.
)
echo.

echo ==========================================
echo  Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Update .env file with your database credentials
echo 2. Run 'npm run db:push' to create database tables
echo 3. Run 'npm run dev' to start development server
echo 4. Visit http://localhost:3000
echo.
pause
