import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  headerButtons?: React.ReactNode
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, className, maxWidth = "2xl", headerButtons }, ref) => {
    if (!isOpen) return null

    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md", 
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl"
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div 
          ref={ref}
          className={cn(
            "bg-white rounded-2xl p-6 w-full mx-4",
            maxWidthClasses[maxWidth],
            className
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">{title}</h2>
            <div className="flex items-center gap-4">
              {headerButtons}
              <Button variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {children}
        </div>
      </div>
    )
  }
)
Modal.displayName = "Modal"

export { Modal } 