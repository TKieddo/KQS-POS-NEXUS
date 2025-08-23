'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronDown, ChevronLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu } from '@/components/ui/dropdown-menu'

interface NexusHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backUrl?: string
  showHome?: boolean
}

export const NexusHeader = ({ title, subtitle, showBack, backUrl, showHome }: NexusHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-col space-y-2 px-4 lg:px-8 py-4 bg-black text-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-white hover:bg-white/10 hover:text-white"
              onClick={() => backUrl ? router.push(backUrl) : router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}
          {showHome && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-white hover:bg-white/10 hover:text-white"
              onClick={() => router.push('/nexus')}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-[#E5FF29]" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu
            trigger={
              <Button 
                variant="outline" 
                size="sm"
                className="bg-transparent border-gray-700 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-colors"
              >
                <span>All Properties</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            }
          >
            <button
              className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 hover:text-gray-900"
              onClick={() => console.log('Selected Sunset Apartments')}
            >
              Sunset Apartments
            </button>
            <button
              className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 hover:text-gray-900"
              onClick={() => console.log('Selected Green Valley Complex')}
            >
              Green Valley Complex
            </button>
            <button
              className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 hover:text-gray-900"
              onClick={() => console.log('View All Properties')}
            >
              View All Properties
            </button>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}