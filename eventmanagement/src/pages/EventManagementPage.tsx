import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/organisms/DataTable/DataTable'
import { Icon, Badge } from '@/components/atoms'
import { useGetEventsQuery, useDeleteEventMutation } from '@/features/events/api/eventsApi'
import { useAuth } from '@/shared/hooks/useAuth'

export const EventManagementPage = () => {
  const { hasPermission } = useAuth()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [deleteEvent] = useDeleteEventMutation()

  const { data, isLoading } = useGetEventsQuery({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    includePrivate: true,
  })

  const handleDelete = async (eventId: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId).unwrap()
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { 
      accessorKey: 'startDateTime', 
      header: 'Start Date',
      cell: ({ getValue }: any) => new Date(getValue()).toLocaleDateString()
    },
    { accessorKey: 'venue', header: 'Venue' },
    { 
      accessorKey: 'currentRegistrations', 
      header: 'Registrations',
      cell: ({ row }: any) => `${row.original.currentRegistrations}/${row.original.capacity}`
    },
    {
      accessorKey: 'isRegistrationOpen',
      header: 'Status',
      cell: ({ getValue }: any) => (
        <Badge variant={getValue() ? 'default' : 'secondary'}>
          {getValue() ? 'Open' : 'Closed'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/events/${row.original.id}`}>View</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/events/${row.original.id}/edit`}>Edit</Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600"
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Management</h1>
        
        {hasPermission('canCreateEvents') && (
          <Button asChild>
            <Link to="/admin/events/create">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.data?.items || []}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            loading={isLoading}
            totalCount={data?.data?.totalCount}
          />
        </CardContent>
      </Card>
    </div>
  )
}