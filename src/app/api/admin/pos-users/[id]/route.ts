import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    const body = await _req.json()
    if (body?.is_active !== undefined) {
      const { error } = await supabaseAdmin
        .from('pos_public_users')
        .update({ is_active: !!body.is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }
    if (body?.pin) {
      const { error } = await supabaseAdmin.rpc('pos_set_pin', { p_user_id: id, p_pin: body.pin })
      if (error) throw error
      return NextResponse.json({ ok: true })
    }
    if (Array.isArray(body?.branchIds)) {
      // replace branches
      let { error } = await supabaseAdmin.from('pos_public_user_branches').delete().eq('user_id', id)
      if (error) throw error
      if (body.branchIds.length > 0) {
        const rows = body.branchIds.map((bid: string) => ({ user_id: id, branch_id: bid }))
        ;({ error } = await supabaseAdmin.from('pos_public_user_branches').insert(rows))
        if (error) throw error
      }
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    const { error } = await supabaseAdmin.from('pos_public_users').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete' }, { status: 500 })
  }
}


