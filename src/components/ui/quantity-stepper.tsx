import { Minus, Plus } from 'lucide-react'
import { Button } from './button'
import { useRef } from 'react'

interface QuantityStepperProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  onChange?: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const QuantityStepper = ({
  value,
  onIncrement,
  onDecrement,
  onChange,
  min = 1,
  max,
  size = 'md',
  className = ''
}: QuantityStepperProps) => {
  const canDecrement = value > min
  const canIncrement = max ? value < max : true

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  // Handler for direct input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10)
    if (isNaN(val)) val = min
    if (val < min) val = min
    if (max !== undefined && val > max) val = max
    if (onChange) onChange(val)
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={onDecrement}
        disabled={!canDecrement}
        className={`${sizeClasses[size]} rounded-full border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md`}
      >
        <Minus className={`h-3 w-3 ${size === 'lg' ? 'h-4 w-4' : ''}`} />
      </Button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInputChange}
        className={`font-bold text-gray-900 min-w-[3rem] text-center ${textSizes[size]} w-16 border border-input bg-[hsl(var(--input))] rounded-[var(--radius)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-[hsl(var(--accent))]`}
        style={{ appearance: 'textfield' }}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={onIncrement}
        disabled={!canIncrement}
        className={`${sizeClasses[size]} rounded-full border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md`}
      >
        <Plus className={`h-3 w-3 ${size === 'lg' ? 'h-4 w-4' : ''}`} />
      </Button>
    </div>
  )
} 