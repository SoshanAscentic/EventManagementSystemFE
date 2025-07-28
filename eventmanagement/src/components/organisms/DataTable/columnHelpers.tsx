import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/atoms'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'

// Helper function to create action columns
export const createActionColumn = <T,>(actions: Array<{
  label: string
  icon?: string
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  disabled?: (item: T) => boolean
}>): ColumnDef<T> => {
  return {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'ghost'}
            size="sm"
            onClick={() => action.onClick(row.original)}
            disabled={action.disabled?.(row.original)}
          >
            {action.icon && <Icon name={action.icon as any} className="h-4 w-4 mr-1" />}
            {action.label}
          </Button>
        ))}
      </div>
    ),
  }
}

// Helper function to create status badge columns
export const createStatusColumn = <T,>(
  accessorKey: keyof T,
  statusMap: Record<string, { label: string; variant: string }>
): ColumnDef<T> => {
  return {
    accessorKey: accessorKey as string,
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      const statusConfig = statusMap[status] || { label: status, variant: 'default' }
      
      return (
        <Badge variant={statusConfig.variant as any}>
          {statusConfig.label}
        </Badge>
      )
    },
  }
}

// Helper function to create date columns
export const createDateColumn = <T,>(
  accessorKey: keyof T,
  header: string,
  format?: string
): ColumnDef<T> => {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ getValue }) => {
      const date = getValue() as string
      return formatDate(date, format ? { dateStyle: format as any } : undefined)
    },
  }
}

// Helper function to create currency columns
export const createCurrencyColumn = <T,>(
  accessorKey: keyof T,
  header: string,
  currency = 'USD'
): ColumnDef<T> => {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ getValue }) => {
      const amount = getValue() as number
      return formatCurrency(amount, currency)
    },
  }
}

// Helper function to create boolean columns
export const createBooleanColumn = <T,>(
  accessorKey: keyof T,
  header: string,
  trueLabel = 'Yes',
  falseLabel = 'No'
): ColumnDef<T> => {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as boolean
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? trueLabel : falseLabel}
        </Badge>
      )
    },
  }
}