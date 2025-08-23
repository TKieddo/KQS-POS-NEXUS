import { Table, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ViewToggleProps {
  currentView: 'table' | 'gallery'
  onViewChange: (view: 'table' | 'gallery') => void
  className?: string
}

export const ViewToggle = ({ currentView, onViewChange, className }: ViewToggleProps) => {
  return (
    <div className={cn("flex items-center gap-1 bg-gray-100 rounded-lg p-1", className)}>
      <Button
        size="sm"
        variant={currentView === 'table' ? 'default' : 'ghost'}
        onClick={() => onViewChange('table')}
        className={cn(
          "h-8 px-3 text-xs font-medium transition-all",
          currentView === 'table' 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <Table className="mr-1.5 h-3.5 w-3.5" />
        Table
      </Button>
      
      <Button
        size="sm"
        variant={currentView === 'gallery' ? 'default' : 'ghost'}
        onClick={() => onViewChange('gallery')}
        className={cn(
          "h-8 px-3 text-xs font-medium transition-all",
          currentView === 'gallery' 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <Grid3X3 className="mr-1.5 h-3.5 w-3.5" />
        Gallery
      </Button>
    </div>
  )
} 