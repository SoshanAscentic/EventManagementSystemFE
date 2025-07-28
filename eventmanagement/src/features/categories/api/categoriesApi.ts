// src/features/categories/api/categoriesApi.ts
import { baseApi } from '@/app/api/baseApi'
import { CategoryDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoriesQueryParams,
  CategoryStatisticsDto,
  CategoryTreeNode,
} from '../types'

// ===== UTILITY FUNCTIONS =====

const cleanParams = (params: Record<string, any>) => {
  const cleaned: Record<string, any> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value
      } else if (!Array.isArray(value)) {
        cleaned[key] = value
      }
    }
  })
  return cleaned
}

// ===== CATEGORIES API ENDPOINTS =====

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== READ OPERATIONS =====
    
    getCategories: builder.query<ApiResponse<CategoryDto[]>, CategoriesQueryParams>({
      query: (params) => ({
        url: '/categories',
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result?.success
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getCategoryById: builder.query<ApiResponse<CategoryDto>, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    getActiveCategories: builder.query<ApiResponse<CategoryDto[]>, void>({
      query: () => ({
        url: '/categories',
        params: { activeOnly: true, includeEventCount: true },
      }),
      providesTags: [{ type: 'Category', id: 'ACTIVE' }],
    }),

    getCategoryTree: builder.query<ApiResponse<CategoryTreeNode[]>, void>({
      query: () => '/categories/tree',
      providesTags: [{ type: 'Category', id: 'TREE' }],
    }),

    searchCategories: builder.query<ApiResponse<CategoryDto[]>, { searchTerm: string; limit?: number }>({
      query: ({ searchTerm, limit = 10 }) => ({
        url: '/categories/search',
        params: { searchTerm, limit },
      }),
      providesTags: [{ type: 'Category', id: 'SEARCH' }],
    }),

    getPopularCategories: builder.query<ApiResponse<CategoryDto[]>, { limit?: number }>({
      query: ({ limit = 5 } = {}) => ({
        url: '/categories/popular',
        params: { limit },
      }),
      providesTags: [{ type: 'Category', id: 'POPULAR' }],
    }),

    // ===== CREATE/UPDATE/DELETE OPERATIONS =====

    createCategory: builder.mutation<ApiResponse<CategoryDto>, CreateCategoryRequest>({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
        { type: 'Category', id: 'TREE' },
        { type: 'Category', id: 'POPULAR' },
      ],
    }),

    updateCategory: builder.mutation<ApiResponse<void>, UpdateCategoryRequest>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
        { type: 'Category', id: 'TREE' },
        { type: 'Category', id: 'POPULAR' },
      ],
    }),

    deleteCategory: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
        { type: 'Category', id: 'TREE' },
        { type: 'Category', id: 'POPULAR' },
        { type: 'Event', id: 'LIST' }, // Events might be affected
      ],
    }),

    toggleCategoryStatus: builder.mutation<ApiResponse<void>, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/categories/${id}/toggle-status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
      ],
    }),

    // ===== ADMIN OPERATIONS =====

    getCategoryStatistics: builder.query<ApiResponse<CategoryStatisticsDto>, { fromDate?: string; toDate?: string }>({
      query: (params) => ({
        url: '/admin/categories/statistics',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Statistics', id: 'CATEGORIES' }],
    }),

    bulkUpdateCategories: builder.mutation<ApiResponse<void>, { categoryIds: number[]; updates: Partial<CreateCategoryRequest> }>({
      query: (data) => ({
        url: '/admin/categories/bulk-update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
      ],
    }),

    exportCategories: builder.mutation<Blob, { format: 'csv' | 'excel'; filters?: CategoriesQueryParams }>({
      query: ({ format, filters }) => ({
        url: '/admin/categories/export',
        method: 'POST',
        body: { format, filters: cleanParams(filters || {}) },
        responseHandler: (response: { blob: () => any }) => response.blob(),
      }),
    }),

    // ===== CATEGORY RELATIONSHIPS =====

    getCategoryEvents: builder.query<ApiResponse<any[]>, { categoryId: number; limit?: number }>({
      query: ({ categoryId, limit = 10 }) => ({
        url: `/categories/${categoryId}/events`,
        params: { limit },
      }),
      providesTags: (result, error, { categoryId }) => [
        { type: 'Event', id: `CATEGORY_${categoryId}` }
      ],
    }),

    getSubcategories: builder.query<ApiResponse<CategoryDto[]>, number>({
      query: (parentId) => `/categories/${parentId}/subcategories`,
      providesTags: (result, error, parentId) => [
        { type: 'Category', id: `CHILDREN_${parentId}` }
      ],
    }),

    // ===== CATEGORY ICONS AND COLORS =====

    updateCategoryAppearance: builder.mutation<ApiResponse<void>, { id: number; color?: string; icon?: string }>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}/appearance`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    getAvailableIcons: builder.query<ApiResponse<string[]>, void>({
      query: () => '/categories/available-icons',
      providesTags: [{ type: 'Category', id: 'ICONS' }],
    }),
  }),
})

// ===== EXPORTED HOOKS =====

export const {
  // Read operations
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetActiveCategoriesQuery,
  useGetCategoryTreeQuery,
  useSearchCategoriesQuery,
  useGetPopularCategoriesQuery,
  
  // Create/Update/Delete operations
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  
  // Admin operations
  useGetCategoryStatisticsQuery,
  useBulkUpdateCategoriesMutation,
  useExportCategoriesMutation,
  
  // Relationships
  useGetCategoryEventsQuery,
  useGetSubcategoriesQuery,
  
  // Appearance
  useUpdateCategoryAppearanceMutation,
  useGetAvailableIconsQuery,
} = categoriesApi