import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/components/molecules'
import { Icon } from '@/components/atoms'
import { useGetCategoriesQuery } from '@/features/categories/api/categoriesApi'

interface AdvancedFilters {
  searchTerm: string
  categoryId?: number
  eventType?: string
  startDate?: string
  endDate?: string
  priceRange?: { min: number; max: number }
  location?: string
  hasAvailableSpots: boolean
  isFeatured: boolean
  tags: string[]
}

interface EventFiltersProps {
  filters: AdvancedFilters
  onFilterChange: (filters: AdvancedFilters) => void
  onClear: () => void
}

export const EventFilters = ({ filters, onFilterChange, onClear }: EventFiltersProps) => {
  const { data: categoriesResponse } = useGetCategoriesQuery({ activeOnly: true })
  const categories = categoriesResponse?.data || []
  
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    updateFilter('tags', newTags)
  }

  const popularTags = ['Free', 'Online', 'Networking', 'Beginner Friendly', 'Certificate', 'Hands-on']

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Icon name="Filter" className="mr-2 h-5 w-5" />
            Filters
          </span>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <SearchBox
            placeholder="Search events, topics, speakers..."
            value={filters.searchTerm}
            onChange={(value) => updateFilter('searchTerm', value)}
            onClear={() => updateFilter('searchTerm', '')}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => updateFilter('categoryId', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((category: { id: Key | readonly string[] | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; eventCount: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.eventCount})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium mb-2">Quick Filters</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasAvailableSpots}
                onChange={(e) => updateFilter('hasAvailableSpots', e.target.checked)}
                className="mr-2"
              />
              Available spots only
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isFeatured}
                onChange={(e) => updateFilter('isFeatured', e.target.checked)}
                className="mr-2"
              />
              Featured events
            </label>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} className="mr-2 h-4 w-4" />
          {isExpanded ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <select
                value={filters.eventType || ''}
                onChange={(e) => updateFilter('eventType', e.target.value || undefined)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Networking">Networking</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                placeholder="City, state, or address"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) && (
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-1">
              {filters.searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Search: {filters.searchTerm}
                </span>
              )}
              {filters.categoryId && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Category: {categories.find((c: { id: number | undefined }) => c.id === filters.categoryId)?.name}
                </span>
              )}
              {filters.hasAvailableSpots && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Available spots
                </span>
              )}
              {filters.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}