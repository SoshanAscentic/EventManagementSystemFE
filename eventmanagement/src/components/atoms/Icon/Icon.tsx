import { LucideProps } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof Icons
  className?: string
}

export const Icon = ({ name, className, size = 24, ...props }: IconProps) => {
  const LucideIcon = Icons[name] as React.ComponentType<LucideProps>
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`)
    return <Icons.AlertCircle size={size} className={cn('text-red-500', className)} />
  }

  return <LucideIcon size={size} className={className} {...props} />
}