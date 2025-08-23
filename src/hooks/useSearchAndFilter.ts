import { useState, useEffect, useMemo } from 'react'

interface UseSearchAndFilterOptions<T> {
  data: T[]
  searchFields: (keyof T)[]
  searchQuery: string
  filters?: {
    [key: string]: {
      value: string
      field: keyof T
      transform?: (value: any) => any
    }
  }
}

export function useSearchAndFilter<T>({
  data,
  searchFields,
  searchQuery,
  filters = {}
}: UseSearchAndFilterOptions<T>) {
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(query)
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filter]) => {
      if (filter.value && filter.value !== 'all') {
        filtered = filtered.filter(item => {
          const value = item[filter.field]
          const filterValue = filter.transform ? filter.transform(filter.value) : filter.value
          return value === filterValue
        })
      }
    })

    return filtered
  }, [data, searchFields, searchQuery, filters])

  return filteredData
} 