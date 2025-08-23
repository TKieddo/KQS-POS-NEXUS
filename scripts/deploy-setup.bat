@echo off
REM KQS POS Deployment Setup Script for Windows
REM This script helps you prepare your project for GitHub and Vercel deployment

echo 🚀 KQS POS Deployment Setup
echo ==========================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Clean up build artifacts
echo 🧹 Cleaning up build artifacts...
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules
if exist .vercel rmdir /s /q .vercel

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Test build
echo 🔨 Testing build...
npm run build

if errorlevel 1 (
    echo ❌ Build failed. Please fix the issues before deploying.
    pause
    exit /b 1
) else (
    echo ✅ Build successful
)

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  .env.local file not found
    echo 📝 Creating .env.local from template...
    copy env.example .env.local
    echo ✅ Created .env.local
    echo 📋 Please edit .env.local with your actual environment variables
    echo    Required variables:
    echo    - NEXT_PUBLIC_SUPABASE_URL
    echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo    - SUPABASE_SERVICE_ROLE_KEY
    echo    - OPENAI_API_KEY
) else (
    echo ✅ .env.local file exists
)

REM Initialize git if not already done
if not exist .git (
    echo 📁 Initializing git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Check git status
echo 📊 Git status:
git status --porcelain

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit .env.local with your environment variables
echo 2. Create a GitHub repository at https://github.com/new
echo 3. Run: git remote add origin https://github.com/yourusername/kqs-pos.git
echo 4. Run: git add . ^&^& git commit -m "Initial commit"
echo 5. Run: git push -u origin main
echo 6. Connect to Vercel at https://vercel.com
echo.
echo 📖 See DEPLOYMENT_GUIDE.md for detailed instructions
pause
