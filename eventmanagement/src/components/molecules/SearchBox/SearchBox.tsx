import { useState, useEffect } from 'react'
import { Input, Icon } from '@/components/atoms'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SearchBoxProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  onClear?: () => void
  debounceMs?: number
  className?: string
}

export const SearchBox = ({ 
  placeholder = 'Search...', 
  value = '', 
  onChange, 
  onClear,
  debounceMs = 300,
  className 
}: SearchBoxProps) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, onChange, debounceMs])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    onClear?.()
  }

  return (
    <div className={cn('relative', className)}>
      <Icon 
        name="Search" 
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" 
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          onClick={handleClear}
        >
          <Icon name="X" className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}