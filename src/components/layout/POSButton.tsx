'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const POSButton: React.FC = () => {
  return (
    <Link href="/pos">
      <Button
        className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 font-semibold"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Open POS
      </Button>
    </Link>
  )
} 