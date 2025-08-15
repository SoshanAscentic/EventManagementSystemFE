import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { formatDate, formatPlural } from '@/shared/utils/formatters'
import type { Category } from '@/features/categories/api/categoriesApi'

interface CategoryCardProps {
  category: Category
  variant?: 'default' | 'admin'
  showActions?: boolean
  onEdit?: (categoryId: number) => void
  onDelete?: (categoryId: number) => void
  onToggleStatus?: (categoryId: number, isActive: boolean) => void
  className?: string
}

export const CategoryCard = ({
  category,
  variant = 'default',
  showActions = false,
  onEdit,
  onDelete,
  onToggleStatus,
  className,
}: CategoryCardProps) => {
  const isAdmin = variant === 'admin'

  return (
    <Card 
      className={cn(
        'bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: category.color || '#3B82F6',
                color: 'white'
              }}
            >
              <Icon 
                name={(category.icon as any) || 'Folder'} 
                className="w-6 h-6" 
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {category.name}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant={category.isActive ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    category.isActive 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
                
                <span className="text-sm text-gray-500">
                  {formatPlural(category.eventCount || 0, 'event')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {isAdmin && showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(category.id)}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                title="Edit category"
              >
                <Icon name="Edit" className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus?.(category.id, !category.isActive)}
                className={cn(
                  "h-8 w-8 p-0",
                  category.isActive 
                    ? "hover:bg-red-50 hover:text-red-600" 
                    : "hover:bg-green-50 hover:text-green-600"
                )}
                title={category.isActive ? "Deactivate category" : "Activate category"}
              >
                <Icon name={category.isActive ? "EyeOff" : "Eye"} className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(category.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                title="Delete category"
                disabled={!!category.eventCount && category.eventCount > 0}
              >
                <Icon name="Trash2" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Icon name="Calendar" className="w-4 h-4 mr-1 text-blue-500" />
              <span>{category.eventCount || 0} events</span>
            </div>
            
            <div className="flex items-center">
              <Icon name="Clock" className="w-4 h-4 mr-1 text-gray-400" />
              <span>Created {formatDate(category.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isAdmin && showActions ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(category.id)}
              className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              <Icon name="Edit" className="w-4 h-4 mr-2" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-300"
            >
              <Link to={`/events?category=${category.id}`}>
                <Icon name="Eye" className="w-4 h-4 mr-2" />
                View Events
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              <Link to={`/events?category=${category.id}`}>
                <Icon name="Eye" className="w-4 h-4 mr-2" />
                View Events ({category.eventCount || 0})
              </Link>
            </Button>
          </div>
        )}

        {/* Warning for categories with events when trying to delete */}
        {isAdmin && category.eventCount && category.eventCount > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-xs text-yellow-800">
              <Icon name="AlertTriangle" className="w-3 h-3 mr-1" />
              Cannot delete: Category has {category.eventCount} event{category.eventCount !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}