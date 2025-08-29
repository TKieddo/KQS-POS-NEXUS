import React from 'react'
import '../globals.css'
import { POSProviders } from './POSProviders'

export const metadata = {
  title: 'KQS POS - Point of Sale',
  description: 'Point of Sale interface for KQS POS System',
}

export default function POSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <POSProviders>
      <div className="min-h-screen flex flex-col">{children}</div>
    </POSProviders>
  )
} 