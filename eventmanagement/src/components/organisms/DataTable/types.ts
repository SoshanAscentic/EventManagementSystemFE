import { type ColumnDef } from '@tanstack/react-table'

export interface DataTableColumn<T = any> {
  accessorKey?: keyof T
  header: string
  cell?: (props: { getValue: () => any; row: { original: T } }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number
}

export interface DataTableAction<T = any> {
  label: string
  icon?: string
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline'
  disabled?: (item: T) => boolean
}

export interface DataTableBulkAction<T = any> {
  label: string
  icon?: string
  onClick: (items: T[]) => void
  variant?: 'default' | 'destructive' | 'outline'
}