import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  className?: string
}

const sizeClasses = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6', 
  large: 'h-8 w-8'
}

export const Spinner = ({ size = 'medium', color, className }: SpinnerProps) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      style={color ? { borderColor: color, borderTopColor: 'transparent' } : {}}
      data-testid="spinner"
    />
  )
}