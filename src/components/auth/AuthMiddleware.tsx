'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { SessionTimeoutWarning } from './SessionTimeoutWarning'

interface AuthMiddlewareProps {
  children: React.ReactNode
}

export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const { sessionTimeoutWarning } = useAuth()

  return (
    <>
      {children}
      <SessionTimeoutWarning />
    </>
  )
} 