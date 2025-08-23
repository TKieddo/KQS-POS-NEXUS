"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ReceiptFormData, ReceiptWithDetails } from '../types/property';
import { v4 as uuidv4 } from 'uuid';

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<ReceiptWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch receipts with details
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_receipts')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          payment:property_payments(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      setReceipts(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate receipt number
  const generateReceiptNumber = () => {
    const prefix = 'KQS-REC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  // Add receipt
  const addReceipt = async (data: ReceiptFormData) => {
    try {
      setLoading(true);
      const { data: newReceipt, error } = await supabase
        .from('property_receipts')
        .insert({
          id: uuidv4(),
          receipt_number: data.receipt_number || generateReceiptNumber(),
          date: data.date,
          due_date: data.due_date,
          tenant_id: data.tenant_id,
          building_id: data.building_id,
          items: data.items,
          subtotal: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax_amount: 0, // Will be calculated based on settings
          total: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          payment_method: data.payment_method,
          notes: data.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setReceipts(prev => [...prev, { ...newReceipt, tenant: null, building: null, payment: null }]);
      setError(null);
      return newReceipt;
    } catch (err: any) {
      console.error('Error adding receipt:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update receipt
  const updateReceipt = async (id: string, data: Partial<ReceiptFormData>) => {
    try {
      setLoading(true);
      const { data: updatedReceipt, error } = await supabase
        .from('property_receipts')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReceipts(prev => prev.map(receipt => 
        receipt.id === id ? { ...receipt, ...updatedReceipt } : receipt
      ));
      setError(null);
      return updatedReceipt;
    } catch (err: any) {
      console.error('Error updating receipt:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete receipt
  const deleteReceipt = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('property_receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReceipts(prev => prev.filter(receipt => receipt.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting receipt:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get receipt by ID
  const getReceipt = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_receipts')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          payment:property_payments(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching receipt:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get receipts by tenant
  const getReceiptsByTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_receipts')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          payment:property_payments(*)
        `)
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false });

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching receipts by tenant:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get receipts by building
  const getReceiptsByBuilding = async (buildingId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_receipts')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          payment:property_payments(*)
        `)
        .eq('building_id', buildingId)
        .order('date', { ascending: false });

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching receipts by building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('property_receipts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_receipts'
      }, (payload) => {
        console.log('Real-time update:', payload);
        fetchReceipts();
      })
      .subscribe();

    // Initial fetch
    fetchReceipts();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    receipts,
    loading,
    error,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    getReceipt,
    getReceiptsByTenant,
    getReceiptsByBuilding,
    generateReceiptNumber,
    fetchReceipts
  };
};