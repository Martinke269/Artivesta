import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Get admin alerts
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const alertType = searchParams.get('alertType')
    const isResolved = searchParams.get('isResolved')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('admin_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (alertType) {
      query = query.eq('alert_type', alertType)
    }

    if (isResolved !== null) {
      query = query.eq('is_resolved', isResolved === 'true')
    }

    const { data, error } = await query

    if (error) throw error

    // Get counts by severity
    const { data: counts } = await supabase
      .from('admin_alerts')
      .select('severity, is_resolved')
      .eq('is_resolved', false)

    const severityCounts = {
      critical: counts?.filter(a => a.severity === 'critical').length || 0,
      warning: counts?.filter(a => a.severity === 'warning').length || 0,
      info: counts?.filter(a => a.severity === 'info').length || 0
    }

    return NextResponse.json({ data, counts: severityCounts })
  } catch (error) {
    console.error('Get admin alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin alerts' },
      { status: 500 }
    )
  }
}

// Update alert (mark as read/resolved)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { alertId, isRead, isResolved, resolutionNotes } = await request.json()

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    const updates: any = {}

    if (isRead !== undefined) {
      updates.is_read = isRead
    }

    if (isResolved !== undefined) {
      updates.is_resolved = isResolved
      if (isResolved) {
        updates.resolved_by = user.id
        updates.resolved_at = new Date().toISOString()
        if (resolutionNotes) {
          updates.resolution_notes = resolutionNotes
        }
      }
    }

    const { error } = await supabase
      .from('admin_alerts')
      .update(updates)
      .eq('id', alertId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
