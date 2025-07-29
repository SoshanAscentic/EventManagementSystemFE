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
}

export interface GetCategoriesParams {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  isActive?: boolean
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
      query: ({ page = 1, pageSize = 10, search, isActive }) => ({
        url: '/categories',
        params: {
          page,
          pageSize,
          ...(search && { search }),
          ...(isActive !== undefined && { isActive }),
        },
      }),
      providesTags: ['Category'],
    }),

    // For compatibility with existing frontend code
    getActiveCategories: builder.query<ApiResponse<CategoryDto[]>, void>({
      query: () => ({
        url: '/categories',
        params: { activeOnly: true },
      }),
      providesTags: [{ type: 'Category', id: 'ACTIVE' }],
    }),

    // ===== CREATE/UPDATE OPERATIONS (Admin only) =====

    createCategory: builder.mutation<ApiResponse<CategoryDto>, CreateCategoryRequest>({
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
    
    getCategory: builder.query<ApiResponse<Category>, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
  }),
})

// ===== EXPORTED HOOKS =====

export const {
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
  useCreateCategoryMutation,
  useGetCategoryQuery,
} = categoriesApi