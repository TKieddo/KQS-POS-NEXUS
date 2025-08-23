'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { BranchProvider } from '@/context/BranchContext'
import { Sidebar } from '@/components/layout/sidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { Loader2 } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated } = useAuth()

  return (
    <ProtectedRoute requireAuth>
      <BranchProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </BranchProvider>
    </ProtectedRoute>
  )
} 