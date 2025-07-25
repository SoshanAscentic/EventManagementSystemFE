export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  errors?: string[]
  data: T
}

export interface PagedResponse<T> extends ApiResponse<{
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}> {}

export interface PaginationParams {
  pageNumber?: number
  pageSize?: number
}
