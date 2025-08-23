'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Building, BuildingFormData } from '../types/property'

interface UseBuildingsReturn {
  buildings: Building[]
  loading: boolean
  error: string | null
  addBuilding: (data: BuildingFormData) => Promise<void>
  updateBuilding: (id: string, data: Partial<Building>) => Promise<void>
  deleteBuilding: (id: string) => Promise<void>
  getBuilding: (id: string) => Building | undefined
  refreshBuildings: () => Promise<void>
}

// Mock data for development
const mockBuildings: Building[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main Street',
    total_units: 20,
    occupied_units: 18,
    property_type: 'apartment',
    year_built: 2010,
    amenities: ['Parking', 'Gym', 'Pool'],
    manager_id: '1',
    total_rent: 40000,
    collected_rent: 38000,
    overdue_payments: 2,
    branch_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Green Valley Complex',
    address: '456 Oak Avenue',
    total_units: 15,
    occupied_units: 13,
    property_type: 'mixed',
    year_built: 2015,
    amenities: ['Parking', 'Security'],
    manager_id: '1',
    total_rent: 30000,
    collected_rent: 28500,
    overdue_payments: 1,
    branch_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const useBuildings = (): UseBuildingsReturn => {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate API call to fetch buildings
  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBuildings(mockBuildings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch buildings')
    } finally {
      setLoading(false)
    }
  }, [])

  // Add new building
  const addBuilding = useCallback(async (data: BuildingFormData) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const newBuilding: Building = {
        id: Date.now().toString(),
        ...data,
        total_rent: 0,
        collected_rent: 0,
        branch_id: '1', // This would come from current user context
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setBuildings(prev => [newBuilding, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add building')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update building
  const updateBuilding = useCallback(async (id: string, data: Partial<Building>) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      setBuildings(prev => prev.map(building => 
        building.id === id 
          ? { ...building, ...data, updated_at: new Date().toISOString() }
          : building
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update building')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete building
  const deleteBuilding = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      setBuildings(prev => prev.filter(building => building.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete building')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single building
  const getBuilding = useCallback((id: string) => {
    return buildings.find(building => building.id === id)
  }, [buildings])

  // Refresh buildings
  const refreshBuildings = useCallback(async () => {
    await fetchBuildings()
  }, [fetchBuildings])

  // Load buildings on mount
  useEffect(() => {
    fetchBuildings()
  }, [fetchBuildings])

  return {
    buildings,
    loading,
    error,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    getBuilding,
    refreshBuildings
  }
}