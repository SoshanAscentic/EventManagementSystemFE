import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: keyof typeof Icons
  className?: string
}

export const StatCard = ({ title, value, change, icon, className }: StatCardProps) => {
  const getTrendColor = () => {
    if (!change) return ''
    switch (change.trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = () => {
    if (!change) return null
    switch (change.trend) {
      case 'up':
        return 'TrendingUp'
      case 'down':
        return 'TrendingDown'
      default:
        return 'Minus'
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={cn('flex items-center text-sm', getTrendColor())}>
                {getTrendIcon() && (
                  <Icon name={getTrendIcon()!} className="mr-1 h-4 w-4" />
                )}
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-full bg-primary/10 p-3">
              <Icon name={icon} className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}