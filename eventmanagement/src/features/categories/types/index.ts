import { PaginationParams } from '@/shared/types/api'

// ===== REQUEST/RESPONSE TYPE DEFINITIONS =====

export interface CreateCategoryRequest {
  name: string
  description?: string
  isActive?: boolean
  color?: string
  icon?: string
  parentId?: number
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number
}

export interface CategoriesQueryParams extends PaginationParams {
  searchTerm?: string
  activeOnly?: boolean
  parentId?: number
  includeEventCount?: boolean
  sortBy?: 'name' | 'eventCount' | 'createdAt'
  ascending?: boolean
}

export interface CategoryStatisticsDto {
  totalCategories: number
  activeCategories: number
  categoriesWithEvents: number
  averageEventsPerCategory: number
  topCategories: Array<{
    id: number
    name: string
    eventCount: number
  }>
  categoryGrowth: Array<{
    month: string
    count: number
  }>
}

// ===== UTILITY TYPES =====

export type CategorySortOption = 'name' | 'eventCount' | 'createdAt'

export interface CategoryFilters {
  searchTerm: string
  activeOnly: boolean
  hasEvents: boolean
}

export interface CategoryTreeNode {
  id: number
  name: string
  description?: string
  children: CategoryTreeNode[]
  eventCount: number
  level: number
}