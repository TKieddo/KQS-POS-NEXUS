'use client'
import React from 'react'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {children}
    </div>
  )
}

export default SettingsLayout 