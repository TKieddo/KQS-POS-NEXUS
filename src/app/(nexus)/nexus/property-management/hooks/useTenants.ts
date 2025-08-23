"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TenantFormData, TenantWithDetails } from '@/types/property';
import { v4 as uuidv4 } from 'uuid';

export const useTenants = () => {
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenants with details
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_tenants')
        .select(`
          *,
          building:property_buildings(*),
          room:property_rooms(*),
          payments:property_payments(*),
          documents:property_documents(*),
          communications:property_communications(*)
        `)
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;

      setTenants(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tenants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add tenant
  const addTenant = async (data: TenantFormData) => {
    try {
      setLoading(true);
      const { data: newTenant, error } = await supabase
        .from('property_tenants')
        .insert({
          id: uuidv4(),
          building_id: data.building_id,
          room_id: data.room_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          lease_start_date: data.lease_start_date,
          lease_end_date: data.lease_end_date,
          monthly_rent: data.monthly_rent,
          security_deposit: data.security_deposit,
          payment_status: 'pending',
          payment_due_date: data.payment_due_date,
          documents: [],
          notes: data.notes,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update building's occupied units and total rent
      const { data: building } = await supabase
        .from('property_buildings')
        .select('occupied_units, total_rent')
        .eq('id', data.building_id)
        .single();

      if (building) {
        await supabase
          .from('property_buildings')
          .update({
            occupied_units: building.occupied_units + 1,
            total_rent: building.total_rent + data.monthly_rent,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.building_id);
      }

      // Update room status if assigned
      if (data.room_id) {
        await supabase
          .from('property_rooms')
          .update({
            status: 'occupied',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.room_id);
      }

      setTenants(prev => [...prev, { ...newTenant, building: null, room: null, payments: [], documents: [], communications: [] }]);
      setError(null);
      return newTenant;
    } catch (err: any) {
      console.error('Error adding tenant:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update tenant
  const updateTenant = async (id: string, data: Partial<TenantFormData>) => {
    try {
      setLoading(true);
      const { data: updatedTenant, error } = await supabase
        .from('property_tenants')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTenants(prev => prev.map(tenant => 
        tenant.id === id ? { ...tenant, ...updatedTenant } : tenant
      ));
      setError(null);
      return updatedTenant;
    } catch (err: any) {
      console.error('Error updating tenant:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete tenant
  const deleteTenant = async (id: string) => {
    try {
      setLoading(true);
      // Get tenant details first
      const tenant = tenants.find(t => t.id === id);
      if (!tenant) throw new Error('Tenant not found');

      const { error } = await supabase
        .from('property_tenants')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update building's occupied units and total rent
      const { data: building } = await supabase
        .from('property_buildings')
        .select('occupied_units, total_rent')
        .eq('id', tenant.building_id)
        .single();

      if (building) {
        await supabase
          .from('property_buildings')
          .update({
            occupied_units: building.occupied_units - 1,
            total_rent: building.total_rent - tenant.monthly_rent,
            updated_at: new Date().toISOString()
          })
          .eq('id', tenant.building_id);
      }

      // Update room status if assigned
      if (tenant.room_id) {
        await supabase
          .from('property_rooms')
          .update({
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', tenant.room_id);
      }

      setTenants(prev => prev.filter(t => t.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting tenant:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get tenant by ID
  const getTenant = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_tenants')
        .select(`
          *,
          building:property_buildings(*),
          room:property_rooms(*),
          payments:property_payments(*),
          documents:property_documents(*),
          communications:property_communications(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching tenant:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get tenants by building
  const getTenantsByBuilding = async (buildingId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_tenants')
        .select(`
          *,
          building:property_buildings(*),
          room:property_rooms(*),
          payments:property_payments(*),
          documents:property_documents(*),
          communications:property_communications(*)
        `)
        .eq('building_id', buildingId)
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching tenants by building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('property_tenants_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_tenants'
      }, (payload) => {
        console.log('Real-time update:', payload);
        fetchTenants();
      })
      .subscribe();

    // Initial fetch
    fetchTenants();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    tenants,
    loading,
    error,
    addTenant,
    updateTenant,
    deleteTenant,
    getTenant,
    getTenantsByBuilding,
    fetchTenants
  };
};