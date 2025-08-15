import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  onClear?: () => void
  disabled?: boolean
}

export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  debounceMs = 0,
  onClear,
  disabled = false,
}: SearchBoxProps) => {
  const [internalValue, setInternalValue] = useState(value)

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Handle debounced changes
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        onChange(internalValue)
      }, debounceMs)

      return () => clearTimeout(timer)
    }
  }, [internalValue, onChange, debounceMs])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    
    // If no debounce, call onChange immediately
    if (debounceMs === 0) {
      onChange(newValue)
    }
  }

  const handleClear = () => {
    setInternalValue('')
    onChange('')
    onClear?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {internalValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  )
}