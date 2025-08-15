import { baseApi } from '@/app/api/baseApi'
import { EventDto } from '@/shared/types/domain'
import { ApiResponse } from '@/shared/types/api'

export interface DashboardStats {
  totalEvents: number
  totalUsers: number
  totalRegistrations: number
  activeEvents: number
  recentRegistrations: Array<{
    id: number
    eventTitle: string
    userName: string
    registeredAt: string
  }>
  popularEvents: Array<{
    id: number
    title: string
    registrationCount: number
  }>
}

export interface AdminStatistics {
  totalEvents: number
  totalUsers: number
  totalRegistrations: number
  revenueThisMonth: number
  eventsByCategory: Array<{
    categoryName: string
    count: number
  }>
  registrationsByMonth: Array<{
    month: string
    count: number
  }>
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/admin/dashboard',
      providesTags: [{ type: 'Statistics', id: 'DASHBOARD' }],
    }),

    getStatistics: builder.query<ApiResponse<AdminStatistics>, { fromDate?: string }>({
      query: (params) => ({
        url: '/admin/statistics', 
        params: params.fromDate ? { fromDate: params.fromDate } : {},
      }),
      providesTags: [{ type: 'Statistics', id: 'ADMIN' }],
    }),

    getCapacityAlerts: builder.query<ApiResponse<EventDto[]>, { threshold?: number }>({
      query: (params) => ({
        url: '/admin/events/capacity-alerts',
        params: { threshold: params?.threshold ?? 0.8 },
      }),
      providesTags: [{ type: 'Event', id: 'CAPACITY_ALERTS' }],
    }),
  }),
})

export const {
  useGetDashboardQuery,
  useGetStatisticsQuery, 
  useGetCapacityAlertsQuery,
} = adminApi