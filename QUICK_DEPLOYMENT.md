# 🚀 Quick Deployment Guide

**Get your KQS POS system live in 10 minutes!**

## ⚡ Quick Start (Windows)

1. **Run the setup script:**
   ```cmd
   scripts\deploy-setup.bat
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Name: `kqs-pos`
   - Make it **Private**
   - Don't initialize with README

3. **Push to GitHub:**
   ```cmd
   git remote add origin https://github.com/yourusername/kqs-pos.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

4. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables (see below)
   - Click Deploy

## 🔑 Required Environment Variables

Add these in Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🔄 Live Updates

After deployment, make updates:

```cmd
git checkout -b feature/update
# Make changes
git add .
git commit -m "feat: new feature"
git push origin feature/update
# Create PR on GitHub
# Merge to main = auto-deploy to production
```

## 📖 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**Your app will be live at:** `https://your-app.vercel.app`
