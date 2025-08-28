import React from 'react'
import { Inter } from 'next/font/google'
import '../globals.css'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { Sidebar } from '@/components/layout/sidebar'
import { BranchProvider } from '@/context/BranchContext'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KQS Admin - Business Management',
  description: 'Admin dashboard for KQS POS System',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <BranchProvider>
        <div className="h-screen bg-[hsl(var(--background))] flex overflow-hidden">
          {/* Sticky Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Sticky Header */}
            <div className="flex-shrink-0">
              <AdminHeader />
            </div>
            
            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </BranchProvider>
    </AuthProvider>
  )
}
