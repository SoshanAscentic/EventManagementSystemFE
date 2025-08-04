import { useCallback, useMemo, useState } from 'react'
import { 
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
  useCreateCategoryMutation,
  categoriesApi,
} from '../api/categoriesApi'
import { useAppDispatch } from '@/app/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { 
  CategoriesQueryParams, 
  CreateCategoryRequest,
  CategoryFilters,
} from '../types'

// ===== OPTIMIZED QUERIES =====

/**
 * Hook for getting active categories with caching
 */
export const useActiveCategories = () => {
  return useGetActiveCategoriesQuery(undefined, {
    // Cache for 10 minutes since categories don't change often
    pollingInterval: 600000,
    refetchOnFocus: false,
  })
}

/**
 * Hook for category search with debouncing
 */
export const useCategorySearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const { data: searchResults, isLoading } = useGetCategoriesQuery({
    searchTerm: debouncedSearchTerm,
    activeOnly: true,
  }, {
    skip: debouncedSearchTerm.length < 2,
  })
  
  return {
    searchTerm,
    setSearchTerm,
    searchResults: searchResults?.data || [],
    isLoading,
  }
}

// ===== CATEGORY MANAGEMENT HOOKS =====

/**
 * Hook for category creation with validation
 */
export const useCreateCategoryWithAuth = () => {
  const { hasPermission } = useAuth()
  const [createCategory, result] = useCreateCategoryMutation()
  
  const createCategoryIfAuthorized = useCallback(async (data: CreateCategoryRequest) => {
    if (!hasPermission('canManageCategories')) {
      throw new Error('You do not have permission to create categories')
    }
    
    // Validate category name
    if (!data.name?.trim()) {
      throw new Error('Category name is required')
    }
    
    if (data.name.length > 100) {
      throw new Error('Category name must be less than 100 characters')
    }
    
    try {
      const response = await createCategory({
        ...data,
        name: data.name.trim(),
        description: data.description?.trim(),
      }).unwrap()
      return response
    } catch (error: any) {
      if (error.status === 409) {
        throw new Error('A category with this name already exists')
      }
      throw error
    }
  }, [createCategory, hasPermission])
  
  return [createCategoryIfAuthorized, result] as const
}

// ===== FILTER HOOKS =====

/**
 * Hook for managing category filters
 */
export const useCategoryFilters = (initialFilters: CategoryFilters = {
  searchTerm: '',
  activeOnly: true,
  hasEvents: false,
}) => {
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters)
  
  const updateFilter = useCallback((key: keyof CategoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])
  
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.activeOnly !== initialFilters.activeOnly ||
      filters.hasEvents !== initialFilters.hasEvents
    )
  }, [filters, initialFilters])
  
  // Convert to API params
  const apiParams = useMemo((): CategoriesQueryParams => ({
    searchTerm: filters.searchTerm || undefined,
    activeOnly: filters.activeOnly,
    includeEventCount: true,
  }), [filters])
  
  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    apiParams,
  }
}

// ===== CATEGORY TREE HOOKS =====

/**
 * Hook for building category tree structure
 */
export const useCategoryTree = () => {
  const { data: categoriesData } = useGetCategoriesQuery({
    includeEventCount: true,
  })
  
  const categoryTree = useMemo(() => {
    if (!categoriesData?.data) return []
    
    const categories = categoriesData.data
    const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, children: [] }]))
    const rootCategories: any[] = []
    
    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(categoryMap.get(category.id))
        }
      } else {
        rootCategories.push(categoryMap.get(category.id))
      }
    })
    
    return rootCategories
  }, [categoriesData])
  
  return {
    categoryTree,
    flatCategories: categoriesData?.data || [],
    isLoading: !categoriesData,
  }
}

// ===== UTILITY HOOKS =====

/**
 * Hook for category validation
 */
export const useCategoryValidation = () => {
  const validateCategory = useCallback((data: CreateCategoryRequest) => {
    const errors: string[] = []
    
    if (!data.name?.trim()) {
      errors.push('Category name is required')
    } else if (data.name.length > 100) {
      errors.push('Category name must be less than 100 characters')
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }
    
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('Color must be a valid hex color code')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [])
  
  const formatCategoryForApi = useCallback((data: any): CreateCategoryRequest => {
    return {
      name: data.name?.trim(),
      description: data.description?.trim() || undefined,
      isActive: Boolean(data.isActive ?? true),
      color: data.color || undefined,
      icon: data.icon || undefined,
      parentId: data.parentId ? Number(data.parentId) : undefined,
    }
  }, [])
  
  return {
    validateCategory,
    formatCategoryForApi,
  }
}

/**
 * Hook for cache management
 */
export const useCategoryCacheManagement = () => {
  const dispatch = useAppDispatch()
  
  const invalidateCategoryCaches = useCallback((categoryId?: number) => {
    if (categoryId) {
      dispatch(categoriesApi.util.invalidateTags([
        { type: 'Category', id: categoryId },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
        { type: 'Category', id: 'TREE' },
      ]))
    } else {
      dispatch(categoriesApi.util.invalidateTags([
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ACTIVE' },
        { type: 'Category', id: 'TREE' },
      ]))
    }
  }, [dispatch])
  
  const prefetchCategory = useCallback((categoryId: number) => {
    dispatch(categoriesApi.util.prefetch('getCategoryById', categoryId, { force: false }))
  }, [dispatch])
  
  return {
    invalidateCategoryCaches,
    prefetchCategory,
  }
}

// ===== EXPORT ALL HOOKS =====

export {
  // API hooks
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
  useCreateCategoryMutation,
} from '../api/categoriesApi'