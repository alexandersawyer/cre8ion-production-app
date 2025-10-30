import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Create a new schedule item
export async function POST(request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('production_schedule')
      .insert({
        show_id: body.show_id,
        session_type: body.session_type || 'Session',
        date: body.date || '',
        start_time: body.start_time || '',
        end_time: body.end_time || '',
        name: body.name || '',
        location: body.location || '',
        notes: body.notes || '',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}