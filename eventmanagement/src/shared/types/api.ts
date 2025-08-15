export interface BackendApiResponse<T = any> {
  isSuccess: boolean
  message?: string
  errors?: string[] | null
  data: T
}

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

export const transformBackendResponse = <T>(backendResponse: BackendApiResponse<T>): ApiResponse<T> => {
  return {
    success: backendResponse.isSuccess,
    message: backendResponse.message,
    errors: backendResponse.errors || [],
    data: backendResponse.data
  }
}