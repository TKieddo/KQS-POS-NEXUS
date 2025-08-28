'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))] mx-auto mb-4"></div>
        <p className="text-[hsl(var(--primary))]">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
} 