#!/bin/bash

# KQS POS Deployment Setup Script
# This script helps you prepare your project for GitHub and Vercel deployment

echo "🚀 KQS POS Deployment Setup"
echo "=========================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Clean up build artifacts
echo "🧹 Cleaning up build artifacts..."
rm -rf .next/
rm -rf node_modules/
rm -rf .vercel/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix the issues before deploying."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found"
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ Created .env.local"
    echo "📋 Please edit .env.local with your actual environment variables"
    echo "   Required variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - OPENAI_API_KEY"
else
    echo "✅ .env.local file exists"
fi

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check git status
echo "📊 Git status:"
git status --porcelain

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your environment variables"
echo "2. Create a GitHub repository at https://github.com/new"
echo "3. Run: git remote add origin https://github.com/yourusername/kqs-pos.git"
echo "4. Run: git add . && git commit -m 'Initial commit'"
echo "5. Run: git push -u origin main"
echo "6. Connect to Vercel at https://vercel.com"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
