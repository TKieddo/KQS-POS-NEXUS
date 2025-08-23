'use client'

import { CategoriesManager } from '@/features/categories/components/CategoriesManager'

export default function CategoriesPage() {
  return (
    <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Categories & Options</h1>
          <p className="text-base text-muted-foreground mt-1">Manage product categories, colors, and sizes</p>
        </div>
      </div>

      {/* Categories Manager */}
      <CategoriesManager />
    </div>
  )
} 