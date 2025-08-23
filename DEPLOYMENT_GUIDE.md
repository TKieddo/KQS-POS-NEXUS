# 🚀 KQS POS Deployment Guide

Complete guide to deploy your KQS POS system to GitHub and Vercel for live production updates.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account
- [Supabase](https://supabase.com/) project set up
- Node.js 18+ installed locally

## 🔧 Step 1: Prepare Your Local Project

### 1.1 Clean Up Project Files

Before pushing to GitHub, ensure your project is clean:

```bash
# Remove build artifacts and dependencies
rm -rf .next/
rm -rf node_modules/
rm -rf .vercel/

# Clean up any temporary files
find . -name "*.log" -delete
find . -name "*.tmp" -delete
```

### 1.2 Create Environment File

Create a `.env.local` file (this will be ignored by Git):

```bash
# Copy the example file
cp env.example .env.local

# Edit with your actual values
nano .env.local
```

**Required Environment Variables:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Test Local Build

```bash
# Install dependencies
npm install

# Test the build
npm run build

# Test the production server
npm run start
```

## 📤 Step 2: GitHub Setup

### 2.1 Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: KQS POS system"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/kqs-pos.git

# Push to GitHub
git push -u origin main
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it `kqs-pos`
4. Make it **Private** (recommended for business applications)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2.3 Push Your Code

```bash
# If you haven't already pushed
git push -u origin main
```

## 🌐 Step 3: Vercel Deployment

### 3.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your `kqs-pos` repository
5. Vercel will auto-detect Next.js

### 3.2 Configure Build Settings

**Framework Preset:** Next.js  
**Root Directory:** `./`  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

### 3.3 Set Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables** and add:

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration (Production)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** Set these for **Production**, **Preview**, and **Development** environments.

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

## 🔄 Step 4: Continuous Deployment Setup

### 4.1 Automatic Deployments

Vercel automatically deploys:
- **Main branch** → Production
- **Pull requests** → Preview deployments
- **Other branches** → Preview deployments

### 4.2 Development Workflow

```bash
# Create a new feature branch
git checkout -b feature/new-feature

# Make your changes
# ... edit files ...

# Test locally
npm run dev

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# Vercel will create a preview deployment
```

### 4.3 Production Deployment

```bash
# Merge to main branch
git checkout main
git merge feature/new-feature
git push origin main

# Vercel automatically deploys to production
```

## 🗄️ Step 5: Database Setup

### 5.1 Supabase Production Setup

1. **Create Production Database:**
   - Go to [Supabase](https://supabase.com)
   - Create a new project for production
   - Note down the URL and keys

2. **Run Migrations:**
   ```bash
   # Update your .env.local with production Supabase credentials
   # Run the migration scripts
   node apply-inventory-tables.js
   node apply-pricing-migration.js
   node apply-receipt-templates-migration.js
   node apply-user-management-migration.js
   ```

3. **Set Up RLS Policies:**
   - Ensure all tables have proper Row Level Security
   - Test with production data

### 5.2 Storage Configuration

1. **Configure Storage Buckets:**
   ```sql
   -- Run in Supabase SQL editor
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('product-images', 'product-images', true),
   ('receipts', 'receipts', false),
   ('documents', 'documents', false);
   ```

2. **Set Storage Policies:**
   - Configure access policies for each bucket
   - Test file uploads/downloads

## 🔒 Step 6: Security & Performance

### 6.1 Security Checklist

- [ ] Environment variables are set in Vercel
- [ ] Supabase RLS policies are configured
- [ ] API routes are protected
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

### 6.2 Performance Optimization

- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] Database queries are optimized
- [ ] Caching is implemented
- [ ] CDN is enabled

## 📱 Step 7: PWA Configuration

### 7.1 PWA Setup

Your app is already configured as a PWA. To install:

1. **Desktop:** Visit your app in Chrome/Edge, click install
2. **Mobile:** Add to home screen from browser menu
3. **Offline:** App works offline with service workers

### 7.2 PWA Testing

```bash
# Test PWA locally
npm run build
npm run start

# Check PWA features in browser dev tools
# Application > Service Workers
# Application > Manifest
```

## 🔄 Step 8: Live Updates Workflow

### 8.1 Making Updates

```bash
# 1. Create feature branch
git checkout -b feature/update

# 2. Make changes
# ... edit your code ...

# 3. Test locally
npm run dev
npm run build

# 4. Commit and push
git add .
git commit -m "feat: add new functionality"
git push origin feature/update

# 5. Create Pull Request on GitHub
# 6. Review and merge to main
# 7. Vercel automatically deploys to production
```

### 8.2 Hot Fixes

```bash
# For urgent fixes
git checkout main
git checkout -b hotfix/critical-fix

# Make quick fix
git add .
git commit -m "fix: critical issue"
git push origin hotfix/critical-fix

# Merge immediately
git checkout main
git merge hotfix/critical-fix
git push origin main
```

## 📊 Step 9: Monitoring & Analytics

### 9.1 Vercel Analytics

- **Performance:** Monitor Core Web Vitals
- **Errors:** Track build and runtime errors
- **Usage:** Monitor bandwidth and function calls

### 9.2 Custom Monitoring

```typescript
// Add to your app for custom analytics
export function trackEvent(event: string, data?: any) {
  // Send to your analytics service
  console.log('Event:', event, data);
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Check build logs in Vercel
   # Test locally first
   npm run build
   ```

2. **Environment Variables:**
   - Ensure all variables are set in Vercel
   - Check for typos in variable names

3. **Database Connection:**
   - Verify Supabase credentials
   - Check RLS policies
   - Test connection locally

4. **Performance Issues:**
   - Optimize images
   - Reduce bundle size
   - Implement caching

### Getting Help

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

## 🎉 Success!

Your KQS POS system is now:
- ✅ Deployed on Vercel
- ✅ Connected to GitHub
- ✅ Set up for continuous deployment
- ✅ Ready for live updates
- ✅ Optimized for production

**Your live URL:** `https://your-app.vercel.app`

---

## 📞 Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first
4. Check this guide for common solutions

**Happy deploying! 🚀**
