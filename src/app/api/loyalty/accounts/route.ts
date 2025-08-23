import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      customerId, 
      cardNumber, 
      tier, 
      currentPoints, 
      lifetimePoints, 
      isActive 
    } = body

    if (!customerId || !cardNumber) {
      return NextResponse.json(
        { error: 'Customer ID and card number are required' },
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

    // Check if loyalty account already exists for this customer
    const { data: existingAccount } = await supabase
      .from('loyalty_accounts')
      .select('id')
      .eq('customer_id', customerId)
      .single()

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Customer already has a loyalty account' },
        { status: 409 }
      )
    }

    // Calculate tier points and next tier
    const tierPointsMap = {
      bronze: 0,
      silver: 500,
      gold: 1000,
      platinum: 2000
    }

    const nextTierPointsMap = {
      bronze: 500,
      silver: 1000,
      gold: 2000,
      platinum: 5000
    }

    const tierPoints = tierPointsMap[tier as keyof typeof tierPointsMap] || 0
    const nextTierPoints = nextTierPointsMap[tier as keyof typeof nextTierPointsMap] || 1000
    const pointsToNextTier = nextTierPoints - (currentPoints || 0)

    // Create loyalty account
    const { data: account, error } = await supabase
      .from('loyalty_accounts')
      .insert({
        customer_id: customerId,
        card_number: cardNumber,
        is_active: isActive ?? true,
        current_points: currentPoints || 0,
        lifetime_points: lifetimePoints || 0,
        tier: tier || 'bronze',
        tier_points: tierPoints,
        next_tier_points: nextTierPoints,
        points_to_next_tier: pointsToNextTier
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create loyalty account' },
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