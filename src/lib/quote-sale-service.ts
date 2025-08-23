import { supabase } from './supabase'
import type { CartItem, Customer } from '@/features/pos/types'

export interface Quote {
  id: string
  quote_number: string
  customer_id: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  discount: number
  discount_type: 'percentage' | 'fixed'
  total: number
  valid_until: string
  notes: string
  status: 'active' | 'expired' | 'converted'
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  sale_number: string
  customer_id: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  discount: number
  discount_type: 'percentage' | 'fixed'
  total: number
  payment_method: 'cash' | 'card' | 'credit'
  status: 'completed' | 'pending' | 'cancelled'
  created_at: string
  updated_at: string
}

export const quoteSaleService = {
  // Create a new quote from current cart
  async createQuote(quoteData: {
    customer: Customer
    items: CartItem[]
    subtotal: number
    discount: number
    discountType: 'percentage' | 'fixed'
    total: number
    validUntil: string
    notes: string
  }): Promise<Quote> {
    const quoteNumber = `QT-${Date.now()}`
    
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        quote_number: quoteNumber,
        customer_id: quoteData.customer.id,
        subtotal: quoteData.subtotal,
        discount: quoteData.discount,
        discount_type: quoteData.discountType,
        total: quoteData.total,
        valid_until: quoteData.validUntil,
        notes: quoteData.notes,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    // Insert quote items
    const quoteItems = quoteData.items.map(item => ({
      quote_id: data.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }))

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems)

    if (itemsError) throw itemsError

    return {
      ...data,
      customer: quoteData.customer,
      items: quoteData.items,
      discount_type: data.discount_type as 'percentage' | 'fixed',
      status: data.status as 'active' | 'expired' | 'converted'
    }
  },

  // Get all quotes
  async getQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        quote_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(quote => ({
      ...quote,
      customer: quote.customer,
      items: quote.quote_items.map((item: any) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      discount_type: quote.discount_type as 'percentage' | 'fixed',
      status: quote.status as 'active' | 'expired' | 'converted'
    }))
  },

  // Convert quote to sale
  async convertQuoteToSale(quoteId: string): Promise<Sale> {
    // Get quote with items
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        quote_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', quoteId)
      .single()

    if (quoteError) throw quoteError

    const saleNumber = `SALE-${Date.now()}`
    
    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        sale_number: saleNumber,
        customer_id: quote.customer_id,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discount_type: quote.discount_type,
        total: quote.total,
        payment_method: 'pending',
        status: 'pending'
      })
      .select()
      .single()

    if (saleError) throw saleError

    // Insert sale items
    const saleItems = quote.quote_items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) throw itemsError

    // Update quote status to converted
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ status: 'converted' })
      .eq('id', quoteId)

    if (updateError) throw updateError

    return {
      ...sale,
      customer: quote.customer,
      items: quote.quote_items.map((item: any) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      discount_type: sale.discount_type as 'percentage' | 'fixed',
      status: sale.status as 'completed' | 'pending' | 'cancelled'
    }
  },

  // Get all sales
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        sale_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(sale => ({
      ...sale,
      customer: sale.customer,
      items: sale.sale_items.map((item: any) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      discount_type: sale.discount_type as 'percentage' | 'fixed',
      status: sale.status as 'completed' | 'pending' | 'cancelled'
    }))
  },

  // Convert sale to quote
  async convertSaleToQuote(saleId: string, validUntil: string, notes: string): Promise<Quote> {
    // Get sale with items
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        sale_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', saleId)
      .single()

    if (saleError) throw saleError

    const quoteNumber = `QT-${Date.now()}`
    
    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        quote_number: quoteNumber,
        customer_id: sale.customer_id,
        subtotal: sale.subtotal,
        discount: sale.discount,
        discount_type: sale.discount_type,
        total: sale.total,
        valid_until: validUntil,
        notes: notes,
        status: 'active'
      })
      .select()
      .single()

    if (quoteError) throw quoteError

    // Insert quote items
    const quoteItems = sale.sale_items.map((item: any) => ({
      quote_id: quote.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems)

    if (itemsError) throw itemsError

    return {
      ...quote,
      customer: sale.customer,
      items: sale.sale_items.map((item: any) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      discount_type: quote.discount_type as 'percentage' | 'fixed',
      status: quote.status as 'active' | 'expired' | 'converted'
    }
  }
} 