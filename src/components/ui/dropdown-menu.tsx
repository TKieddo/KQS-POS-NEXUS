"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface DropdownMenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
  className?: string
}

const DropdownMenu = ({ children, trigger, className }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-sm shadow-md">
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuTrigger = ({ children, className }: DropdownMenuTriggerProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
    >
      {children}
    </Button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

const DropdownMenuContent = ({ children, className, align = "end" }: DropdownMenuContentProps) => {
  return (
    <div className={cn(
      "min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-sm shadow-md",
      align === "end" && "right-0",
      align === "start" && "left-0",
      align === "center" && "left-1/2 transform -translate-x-1/2",
      className
    )}>
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const DropdownMenuItem = ({ children, onClick, className }: DropdownMenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
    >
      {children}
    </button>
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuLabel = ({ children, className }: DropdownMenuLabelProps) => {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-gray-200", className)} />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} 