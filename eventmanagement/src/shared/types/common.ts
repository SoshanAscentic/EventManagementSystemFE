export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
}

export interface FilterState {
  searchTerm?: string
  category?: string
  dateRange?: {
    start?: string
    end?: string
  }
  [key: string]: any
}