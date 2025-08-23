import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if loyalty_customers table exists
    const { data: customers, error: customersError } = await supabase
      .from('loyalty_customers')
      .select('count', { count: 'exact', head: true })

    // Check if loyalty_accounts table exists
    const { data: accounts, error: accountsError } = await supabase
      .from('loyalty_accounts')
      .select('count', { count: 'exact', head: true })

    // Check if credit_accounts table exists
    const { data: creditAccounts, error: creditAccountsError } = await supabase
      .from('credit_accounts')
      .select('count', { count: 'exact', head: true })

    const tableStatus = {
      loyalty_customers: {
        exists: !customersError,
        error: customersError?.message,
        count: customers
      },
      loyalty_accounts: {
        exists: !accountsError,
        error: accountsError?.message,
        count: accounts
      },
      credit_accounts: {
        exists: !creditAccountsError,
        error: creditAccountsError?.message,
        count: creditAccounts
      }
    }

    return NextResponse.json({
      success: true,
      tables: tableStatus,
      message: 'Database table status check completed'
    })
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check database tables',
        message: 'Please run the loyalty_schema.sql in your Supabase database'
      },
      { status: 500 }
    )
  }
} 