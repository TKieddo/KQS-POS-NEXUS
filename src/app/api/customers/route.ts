import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')

    // Create a Supabase client with service role key for server-side operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabaseAdmin
      .from('customers')
      .select(`
        id,
        customer_number,
        first_name,
        last_name,
        email,
        phone,
        address_street,
        address_city,
        address_state,
        address_zip_code,
        address_country,
        status,
        customer_type,
        account_balance,
        credit_limit,
        branch_id,
        last_purchase_date,
        total_purchases,
        total_spent,
        created_at,
        updated_at
      `)

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,customer_number.ilike.%${searchTerm}%`)
    }

    // Fetch customers using service role (bypasses RLS securely)
    const { data, error } = await query.order('first_name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const customerData = await request.json()

    // Create a Supabase client with service role key for server-side operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create customer using service role (bypasses RLS securely)
    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert([customerData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
