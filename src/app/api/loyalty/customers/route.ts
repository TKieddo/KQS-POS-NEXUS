import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { LoyaltyCustomer } from '@/types/loyalty'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { 
      customerNumber, 
      firstName, 
      lastName, 
      email, 
      phone,
      address,
      status,
      customerType,
      notes,
      tags,
      totalPurchases,
      totalSpent
    } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingCustomer } = await supabase
      .from('loyalty_customers')
      .select('id')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      )
    }

    // Create customer
    const { data: customer, error } = await supabase
      .from('loyalty_customers')
      .insert({
        customer_number: customerNumber,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        address_street: address?.street,
        address_city: address?.city,
        address_state: address?.state,
        address_zip_code: address?.zipCode,
        address_country: address?.country || 'USA',
        status: status || 'active',
        customer_type: customerType || 'regular',
        notes: notes || '',
        tags: tags || [],
        total_purchases: totalPurchases || 0,
        total_spent: totalSpent || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Transform the response to match our interface
    const loyaltyCustomer: LoyaltyCustomer = {
      id: customer.id,
      customerNumber: customer.customer_number,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: {
        street: customer.address_street || '',
        city: customer.address_city || '',
        state: customer.address_state || '',
        zipCode: customer.address_zip_code || '',
        country: customer.address_country || 'USA'
      },
      status: customer.status,
      customerType: customer.customer_type,
      loyaltyAccount: undefined,
      creditAccount: undefined,
      notes: customer.notes || '',
      tags: customer.tags || [],
      branchId: customer.branch_id,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      lastPurchaseDate: customer.last_purchase_date,
      totalPurchases: customer.total_purchases,
      totalSpent: customer.total_spent
    }

    return NextResponse.json(loyaltyCustomer, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const customerType = searchParams.get('customerType')

    let query = supabase
      .from('loyalty_customers')
      .select(`
        *,
        loyalty_accounts (*),
        credit_accounts (*)
      `)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,customer_number.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (customerType && customerType !== 'all') {
      query = query.eq('customer_type', customerType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    // Transform the data to match our interface
    const customers: LoyaltyCustomer[] = data?.map(customer => ({
      id: customer.id,
      customerNumber: customer.customer_number,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: {
        street: customer.address_street || '',
        city: customer.address_city || '',
        state: customer.address_state || '',
        zipCode: customer.address_zip_code || '',
        country: customer.address_country || 'USA'
      },
      status: customer.status,
      customerType: customer.customer_type,
      loyaltyAccount: customer.loyalty_accounts?.[0] ? {
        id: customer.loyalty_accounts[0].id,
        customerId: customer.loyalty_accounts[0].customer_id,
        cardNumber: customer.loyalty_accounts[0].card_number,
        isActive: customer.loyalty_accounts[0].is_active,
        currentPoints: customer.loyalty_accounts[0].current_points,
        lifetimePoints: customer.loyalty_accounts[0].lifetime_points,
        tier: customer.loyalty_accounts[0].tier,
        tierPoints: customer.loyalty_accounts[0].tier_points,
        nextTierPoints: customer.loyalty_accounts[0].next_tier_points,
        pointsToNextTier: customer.loyalty_accounts[0].points_to_next_tier,
        lastEarnedDate: customer.loyalty_accounts[0].last_earned_date,
        lastRedeemedDate: customer.loyalty_accounts[0].last_redeemed_date,
        transactions: [],
        createdAt: customer.loyalty_accounts[0].created_at,
        updatedAt: customer.loyalty_accounts[0].updated_at
      } : undefined,
      creditAccount: customer.credit_accounts?.[0] ? {
        id: customer.credit_accounts[0].id,
        customerId: customer.credit_accounts[0].customer_id,
        accountNumber: customer.credit_accounts[0].account_number,
        isActive: customer.credit_accounts[0].is_active,
        creditLimit: customer.credit_accounts[0].credit_limit,
        currentBalance: customer.credit_accounts[0].current_balance,
        availableCredit: customer.credit_accounts[0].available_credit,
        paymentTerms: customer.credit_accounts[0].payment_terms,
        lastPaymentDate: customer.credit_accounts[0].last_payment_date,
        lastPaymentAmount: customer.credit_accounts[0].last_payment_amount,
        overdueAmount: customer.credit_accounts[0].overdue_amount,
        creditScore: customer.credit_accounts[0].credit_score,
        creditHistory: [],
        createdAt: customer.credit_accounts[0].created_at,
        updatedAt: customer.credit_accounts[0].updated_at
      } : undefined,
      notes: customer.notes || '',
      tags: customer.tags || [],
      branchId: customer.branch_id,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      lastPurchaseDate: customer.last_purchase_date,
      totalPurchases: customer.total_purchases,
      totalSpent: customer.total_spent
    })) || []

    return NextResponse.json(customers)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 