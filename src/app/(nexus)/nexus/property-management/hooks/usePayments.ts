"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PaymentFormData, PaymentWithDetails } from '../types/property';
import { v4 as uuidv4 } from 'uuid';

export const usePayments = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments with details
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_payments')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          receipt:property_receipts(*)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add payment
  const addPayment = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      const { data: newPayment, error } = await supabase
        .from('property_payments')
        .insert({
          id: uuidv4(),
          tenant_id: data.tenant_id,
          building_id: data.building_id,
          amount: data.amount,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          receipt_number: data.receipt_number,
          status: 'completed',
          notes: data.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update tenant payment status
      await supabase
        .from('property_tenants')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.tenant_id);

      // Update building collected rent
      const { data: building } = await supabase
        .from('property_buildings')
        .select('collected_rent')
        .eq('id', data.building_id)
        .single();

      if (building) {
        await supabase
          .from('property_buildings')
          .update({
            collected_rent: building.collected_rent + data.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.building_id);
      }

      setPayments(prev => [...prev, { ...newPayment, tenant: null, building: null, receipt: null }]);
      setError(null);
      return newPayment;
    } catch (err: any) {
      console.error('Error adding payment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update payment
  const updatePayment = async (id: string, data: Partial<PaymentFormData>) => {
    try {
      setLoading(true);
      const { data: updatedPayment, error } = await supabase
        .from('property_payments')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, ...updatedPayment } : payment
      ));
      setError(null);
      return updatedPayment;
    } catch (err: any) {
      console.error('Error updating payment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const deletePayment = async (id: string) => {
    try {
      setLoading(true);
      // Get payment details first
      const payment = payments.find(p => p.id === id);
      if (!payment) throw new Error('Payment not found');

      const { error } = await supabase
        .from('property_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update building collected rent
      const { data: building } = await supabase
        .from('property_buildings')
        .select('collected_rent')
        .eq('id', payment.building_id)
        .single();

      if (building) {
        await supabase
          .from('property_buildings')
          .update({
            collected_rent: building.collected_rent - payment.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.building_id);
      }

      setPayments(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get payment by ID
  const getPayment = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_payments')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          receipt:property_receipts(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching payment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get payments by tenant
  const getPaymentsByTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_payments')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          receipt:property_receipts(*)
        `)
        .eq('tenant_id', tenantId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching payments by tenant:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get payments by building
  const getPaymentsByBuilding = async (buildingId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_payments')
        .select(`
          *,
          tenant:property_tenants(*),
          building:property_buildings(*),
          receipt:property_receipts(*)
        `)
        .eq('building_id', buildingId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching payments by building:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('property_payments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_payments'
      }, (payload) => {
        console.log('Real-time update:', payload);
        fetchPayments();
      })
      .subscribe();

    // Initial fetch
    fetchPayments();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    payments,
    loading,
    error,
    addPayment,
    updatePayment,
    deletePayment,
    getPayment,
    getPaymentsByTenant,
    getPaymentsByBuilding,
    fetchPayments
  };
};