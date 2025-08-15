import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Icon, Avatar, AvatarFallback, AvatarImage } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { formatDate, formatUserInitials } from '@/shared/utils/formatters'
import type { UserDto } from '@/shared/types/domain'

interface UserCardProps {
  user: UserDto
  variant?: 'default' | 'admin'
  onViewDetails?: (userId: number) => void
  className?: string
}

export const UserCard = ({
  user,
  variant = 'default',
  onViewDetails,
  className,
}: UserCardProps) => {
  const isAdmin = variant === 'admin'
  const userInitials = formatUserInitials(user.firstName, user.lastName)
  const fullName = `${user.firstName} ${user.lastName}`.trim()

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
            {/* User Avatar */}
            <Avatar className="w-12 h-12 border-2 border-white shadow-md">
              <AvatarImage src={user.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {fullName || 'Unnamed User'}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant={user.isActive ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    user.isActive 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* User Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="Mail" className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          
          {user.phoneNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <Icon name="Phone" className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>{user.phoneNumber}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Icon name="Calendar" className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* User Stats (if available) */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 py-2 bg-gray-50 rounded-lg px-3">
          <div className="flex items-center">
            <Icon name="User" className="w-4 h-4 mr-1 text-blue-500" />
            <span>ID: {user.id}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isAdmin && onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(user.id)}
              className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              <Icon name="Eye" className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}