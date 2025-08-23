import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pos_public_users')
      .select('id, username, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })
    if (error) throw error

    // Attach branches
    const userIds = (data || []).map(u => u.id)
    let branchesMap: Record<string, { id: string; name: string }[]> = {}
    if (userIds.length > 0) {
      const { data: rels, error: relErr } = await supabaseAdmin
        .from('pos_public_user_branches')
        .select('user_id, branch_id')
        .in('user_id', userIds)
      if (relErr) throw relErr

      const branchIds = Array.from(new Set((rels || []).map((r: any) => r.branch_id)))
      let branchIdToName: Record<string, string> = {}
      if (branchIds.length > 0) {
        const { data: branchRows, error: bErr } = await supabaseAdmin
          .from('branches')
          .select('id, name')
          .in('id', branchIds)
        if (bErr) throw bErr
        for (const b of branchRows || []) branchIdToName[b.id] = b.name
      }

      for (const r of rels || []) {
        const arr = branchesMap[r.user_id] || []
        arr.push({ id: r.branch_id, name: branchIdToName[r.branch_id] || '' })
        branchesMap[r.user_id] = arr
      }
    }

    const enriched = (data || []).map(u => ({ ...u, branches: branchesMap[u.id] || [] }))
    return NextResponse.json({ data: enriched })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list users' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, pin, role = 'cashier', branchIds = [] } = body || {}
    if (!username || !pin) {
      return NextResponse.json({ error: 'username and pin are required' }, { status: 400 })
    }

    // Validate branchIds are valid UUIDs if provided
    const validBranchIds = Array.isArray(branchIds) ? branchIds.filter(id => 
      typeof id === 'string' && id.length > 0 && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) : []

    // First create user without branches to avoid type-casting issues with uuid[] in RPC
    const { data: id, error } = await supabaseAdmin.rpc('pos_create_public_user', {
      p_username: username,
      p_pin: pin,
      p_role: role,
      p_branch_ids: [] as string[],
    })
    if (error) throw error

    // Only assign branches if we have valid branch IDs
    if (id && validBranchIds.length > 0) {
      // Verify branches exist before assigning
      const { data: existingBranches, error: branchCheckErr } = await supabaseAdmin
        .from('branches')
        .select('id')
        .in('id', validBranchIds)
      
      if (branchCheckErr) throw branchCheckErr
      
      const existingBranchIds = (existingBranches || []).map(b => b.id)
      
      if (existingBranchIds.length > 0) {
        const rows = existingBranchIds.map((bid: string) => ({ user_id: id as any, branch_id: bid }))
        const { error: insErr } = await supabaseAdmin
          .from('pos_public_user_branches')
          .insert(rows)
        if (insErr) throw insErr
      }
    }
    
    return NextResponse.json({ id, assignedBranches: validBranchIds.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create user' }, { status: 500 })
  }
}


