import { useState } from 'react'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

export function usePagination(initialPageSize: number = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, pageIndex: page - 1 }))
  }

  const setPageSize = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 0 }))
  }

  return {
    pagination,
    setPagination,
    setPage,
    setPageSize,
    currentPage: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  }
}