import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  
  // Pagination
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  totalCount?: number
  
  // Sorting
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  
  // Filtering
  globalFilter?: string
  onGlobalFilterChange?: (filter: string) => void
  
  // Search
  searchPlaceholder?: string
  showSearch?: boolean
  
  // Styling
  className?: string
  
  // Empty state
  emptyMessage?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pagination,
  onPaginationChange,
  totalCount,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  className,
  emptyMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    
    // Server-side pagination
    manualPagination: !!onPaginationChange,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onGlobalFilterChange,
    
    // Page count for server-side pagination
    pageCount: totalCount && pagination 
      ? Math.ceil(totalCount / pagination.pageSize) 
      : undefined,
  })

  if (loading) {
    return <DataTableSkeleton />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      {showSearch && (
        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm">
            <Icon name="Search" className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => onGlobalFilterChange?.(event.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Clear filters if any exist */}
          {(globalFilter || columnFilters.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onGlobalFilterChange?.("")
                setColumnFilters([])
              }}
            >
              <Icon name="X" className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center space-x-2",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none hover:bg-gray-50 -m-2 p-2 rounded"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <Icon
                              name={
                                header.column.getIsSorted() === "desc"
                                  ? "ChevronDown"
                                  : header.column.getIsSorted() === "asc"
                                  ? "ChevronUp"
                                  : "ChevronsUpDown"
                              }
                              className="h-4 w-4"
                            />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Icon name="Database" className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <DataTablePagination
          table={table}
          totalCount={totalCount}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      )}
    </div>
  )
}

// Loading skeleton component
function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  )
}

// Pagination component
interface DataTablePaginationProps<TData> {
  table: any
  totalCount?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
}

function DataTablePagination<TData>({
  table,
  totalCount,
  pagination,
  onPaginationChange,
}: DataTablePaginationProps<TData>) {
  const currentPage = (pagination?.pageIndex ?? 0) + 1
  const pageSize = pagination?.pageSize ?? 10
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : table.getPageCount()

  const handlePageChange = (newPage: number) => {
    if (onPaginationChange) {
      onPaginationChange({
        pageIndex: newPage - 1,
        pageSize,
      })
    } else {
      table.setPageIndex(newPage - 1)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPaginationChange) {
      onPaginationChange({
        pageIndex: 0,
        pageSize: newPageSize,
      })
    } else {
      table.setPageSize(newPageSize)
    }
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="h-8 w-[70px] rounded border border-input bg-background px-2 py-1 text-sm"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </p>
          {totalCount && (
            <p className="text-sm text-muted-foreground">
              ({totalCount} total items)
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <Icon name="ChevronsLeft" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <Icon name="ChevronLeft" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <Icon name="ChevronRight" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <Icon name="ChevronsRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}