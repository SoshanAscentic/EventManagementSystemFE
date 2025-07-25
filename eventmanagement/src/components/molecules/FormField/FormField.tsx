import { Label } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactNode
  className?: string
}

export const FormField = ({ 
  label, 
  error, 
  required, 
  description, 
  children, 
  className 
}: FormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
        {label}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}