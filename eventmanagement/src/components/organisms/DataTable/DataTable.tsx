import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon, Spinner } from '@/components/atoms'

interface Column {
  accessorKey: string
  header: string
  cell?: ({ getValue, row }: any) => React.ReactNode
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  pagination: {
    pageIndex: number
    pageSize: number
  }
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void
  loading?: boolean
  totalCount?: number
}

export const DataTable = ({
  data,
  columns,
  pagination,
  onPaginationChange,
  loading = false,
  totalCount = 0,
}: DataTableProps) => {
  const totalPages = Math.ceil(totalCount / pagination.pageSize)
  const currentPage = pagination.pageIndex + 1

  const tableData = useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      index: pagination.pageIndex * pagination.pageSize + index + 1,
    }))
  }, [data, pagination])

  // Helper function to generate unique row key
  const getRowKey = (row: any, index: number) => {
    // Try to use a unique identifier from the data
    return row.id || row._id || row.uuid || `row-${pagination.pageIndex}-${index}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner size="large" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessorKey} // ✅ This is correct - unique column keys
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                tableData.map((row, rowIndex) => {
                  const rowKey = getRowKey(row, rowIndex)
                  
                  return (
                    <tr key={rowKey} className="hover:bg-gray-50"> {/* ✅ Fixed: Use unique row key */}
                      {columns.map((column) => (
                        <td 
                          key={`${rowKey}-${column.accessorKey}`} // ✅ Fixed: Combine row key + column key
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {column.cell ? (
                            column.cell({
                              getValue: () => row[column.accessorKey],
                              row: { original: row },
                            })
                          ) : (
                            <span className="text-sm text-gray-900">
                              {row[column.accessorKey]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * pagination.pageSize + 1, totalCount)} to{' '}
              {Math.min(currentPage * pagination.pageSize, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: pagination.pageIndex - 1,
                  })
                }
              >
                <Icon name="ChevronLeft" className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: pagination.pageIndex + 1,
                  })
                }
              >
                Next
                <Icon name="ChevronRight" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}