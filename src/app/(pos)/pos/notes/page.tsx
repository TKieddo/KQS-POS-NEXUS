'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct page
    router.replace('/pos/add-note-to-sale-item')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to Add Note to Sale Item</p>
      </div>
    </div>
  )
} 