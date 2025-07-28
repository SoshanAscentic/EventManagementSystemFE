// src/components/organisms/DataTable/EnhancedDataTable.tsx
import { useState } from 'react'
import { DataTable } from './DataTable'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/atoms'
import { type ColumnDef } from '@tanstack/react-table'

interface EnhancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  
  // Selection
  enableSelection?: boolean
  onSelectionChange?: (selectedItems: TData[]) => void
  
  // Bulk actions
  bulkActions?: Array<{
    label: string
    icon?: string
    onClick: (items: TData[]) => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  
  // Export
  enableExport?: boolean
  onExport?: (data: TData[]) => void
  
  // All other DataTable props
  [key: string]: any
}

export function EnhancedDataTable<TData, TValue>({
  columns,
  data,
  enableSelection = false,
  onSelectionChange,
  bulkActions = [],
  enableExport = false,
  onExport,
  ...props
}: EnhancedDataTableProps<TData, TValue>) {
  const [selectedRows, setSelectedRows] = useState<TData[]>([])

  // Add selection column if needed
  const enhancedColumns: ColumnDef<TData, TValue>[] = enableSelection
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ]
    : columns

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {enableSelection && selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.length} item(s) selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon && <Icon name={action.icon as any} className="h-4 w-4 mr-1" />}
                {action.label}
              </Button>
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
      
      {/* Export Button */}
      {enableExport && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.(data)}
          >
            <Icon name="Download" className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      )}

      {/* Main DataTable */}
      <DataTable
        columns={enhancedColumns}
        data={data}
        {...props}
      />
    </div>
  )
}