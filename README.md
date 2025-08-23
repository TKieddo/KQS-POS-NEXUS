# KQS POS - Point of Sale System

A modern, AI-powered Point of Sale system built for small to medium retail businesses. Features offline-first capabilities, lay-bye management, credit accounts, and multi-branch support.

## 🚀 Features

- **Multi-Branch Support**: Manage multiple retail locations
- **Offline-First**: Works without internet connection
- **AI-Powered**: Intelligent product recommendations and analytics
- **Lay-Bye Management**: Complete lay-bye system with payment tracking
- **Credit Accounts**: Customer credit management
- **Real-time Sync**: Automatic data synchronization
- **Modern UI**: Apple-inspired design with premium aesthetics
- **PWA Ready**: Install as desktop/mobile app

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Zustand
- **PWA**: Service workers for offline support

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kqs-pos.git
cd kqs-pos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the database migrations in the `database/` folder
3. Set up Row Level Security (RLS) policies
4. Configure storage buckets

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
kqs-pos/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin routes (backoffice)
│   │   ├── (pos)/            # POS routes (cashier interface)
│   │   ├── (auth)/           # Authentication routes
│   │   └── api/              # API routes
│   ├── components/           # Shared components
│   │   ├── ui/              # Atomic design components
│   │   └── layout/          # Layout components
│   ├── features/            # Feature-based modules
│   ├── lib/                 # Utility libraries
│   ├── types/               # TypeScript definitions
│   └── hooks/               # Custom React hooks
├── database/                # Database migrations and schemas
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to GitHub**:
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Environment Variables**:
   - Add all environment variables in Vercel dashboard
   - Ensure production URLs are set correctly

3. **Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Preview deployments for pull requests

### Environment Variables for Production

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commits for version control

## 📚 Documentation

- [Project Blueprint](./KQS_POS_Project_Blueprint.md)
- [Database Schema](./database/)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the project blueprint

## 🔄 Updates

This project is actively maintained and updated. New features and improvements are deployed regularly through Vercel's automatic deployment system.

---

**Built with ❤️ for modern retail businesses**
