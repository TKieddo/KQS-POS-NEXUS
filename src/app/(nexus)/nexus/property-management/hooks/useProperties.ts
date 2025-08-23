"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BuildingFormData, BuildingWithDetails } from '../types/property';
import { v4 as uuidv4 } from 'uuid';

export const useProperties = () => {
  const [buildings, setBuildings] = useState<BuildingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch buildings with details
  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_buildings')
        .select(`
          *,
          rooms:property_rooms(*),
          tenants:property_tenants(*),
          documents:property_documents(*)
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      setBuildings(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching buildings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add building
  const addBuilding = async (data: BuildingFormData) => {
    try {
      setLoading(true);
      const { data: newBuilding, error } = await supabase
        .from('property_buildings')
        .insert({
          id: uuidv4(),
          name: data.name,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          total_units: data.total_units,
          occupied_units: 0,
          total_rent: 0,
          collected_rent: 0,
          overdue_payments: 0,
          amenities: data.amenities,
          description: data.description,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setBuildings(prev => [...prev, { ...newBuilding, rooms: [], tenants: [], documents: [] }]);
      setError(null);
      return newBuilding;
    } catch (err: any) {
      console.error('Error adding building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update building
  const updateBuilding = async (id: string, data: Partial<BuildingFormData>) => {
    try {
      setLoading(true);
      const { data: updatedBuilding, error } = await supabase
        .from('property_buildings')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBuildings(prev => prev.map(building => 
        building.id === id ? { ...building, ...updatedBuilding } : building
      ));
      setError(null);
      return updatedBuilding;
    } catch (err: any) {
      console.error('Error updating building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete building
  const deleteBuilding = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('property_buildings')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setBuildings(prev => prev.filter(building => building.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get building by ID
  const getBuilding = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_buildings')
        .select(`
          *,
          rooms:property_rooms(*),
          tenants:property_tenants(*),
          documents:property_documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('property_buildings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_buildings'
      }, (payload) => {
        console.log('Real-time update:', payload);
        fetchBuildings();
      })
      .subscribe();

    // Initial fetch
    fetchBuildings();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    buildings,
    loading,
    error,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    getBuilding,
    fetchBuildings
  };
};