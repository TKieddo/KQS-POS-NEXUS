import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      customerId, 
      accountNumber, 
      creditLimit, 
      currentBalance, 
      paymentTerms, 
      creditScore, 
      isActive 
    } = body

    if (!customerId || !accountNumber) {
      return NextResponse.json(
        { error: 'Customer ID and account number are required' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const { data: customer } = await supabase
      .from('loyalty_customers')
      .select('id')
      .eq('id', customerId)
      .single()

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if credit account already exists for this customer
    const { data: existingAccount } = await supabase
      .from('credit_accounts')
      .select('id')
      .eq('customer_id', customerId)
      .single()

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Customer already has a credit account' },
        { status: 409 }
      )
    }

    // Create credit account
    const { data: account, error } = await supabase
      .from('credit_accounts')
      .insert({
        customer_id: customerId,
        account_number: accountNumber,
        is_active: isActive ?? true,
        credit_limit: creditLimit || 0,
        current_balance: currentBalance || 0,
        payment_terms: paymentTerms || 30,
        credit_score: creditScore || 'fair',
        overdue_amount: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create credit account' },
        { status: 500 }
      )
    }

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 