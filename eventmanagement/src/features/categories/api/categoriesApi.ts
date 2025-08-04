import { baseApi } from '@/app/api/baseApi'
import { CategoryDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'

export interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
  eventCount?: number
  createdAt: string
  updatedAt: string
  color?: string
  icon?: string
}

export interface GetCategoriesParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  isActive?: boolean
  ascending?: boolean
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  isActive?: boolean
  color?: string
  icon?: string
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number
}

// ===== UTILITY FUNCTIONS =====

const cleanParams = (params: Record<string, any>) => {
  const cleaned: Record<string, any> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value
    }
  })
  return cleaned
}

// ===== CATEGORIES API ENDPOINTS =====

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== READ OPERATIONS =====
    
    getCategories: builder.query<ApiResponse<PagedResponse<Category>>, GetCategoriesParams>({
      query: ({ pageNumber = 1, pageSize = 10, searchTerm, isActive, ascending = true }) => ({
        url: '/categories',
        params: cleanParams({
          pageNumber,
          pageSize,
          searchTerm,
          isActive,
          ascending,
        }),
      }),
      providesTags: (result) => [
        { type: 'Category', id: 'LIST' },
        ...(result?.data?.data || []).map(({ id }) => ({ type: 'Category' as const, id })),
      ],
    }),

    // For compatibility with existing frontend code
    getActiveCategories: builder.query<ApiResponse<CategoryDto[]>, void>({
      query: () => ({
        url: '/categories',
        params: { activeOnly: true },
      }),
      providesTags: [{ type: 'Category', id: 'ACTIVE' }],
    }),

    getCategory: builder.query<ApiResponse<Category>, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // ===== CREATE/UPDATE/DELETE OPERATIONS (Admin only) =====

    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryRequest>({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
      ],
    }),

    updateCategory: builder.mutation<ApiResponse<Category>, UpdateCategoryRequest>({
      query: ({ id, ...categoryData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
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
      ],
    }),

    // ===== BULK OPERATIONS =====

    toggleCategoryStatus: builder.mutation<ApiResponse<Category>, { id: number; isActive: boolean }>({
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
  }),
})

// ===== EXPORTED HOOKS =====

export const {
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
} = categoriesApi