import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Update a schedule item
export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    console.log('Updating schedule item:', resolvedParams.scheduleId)
    console.log('With data:', body)
    
    const { data, error } = await supabase
      .from('production_schedule')
      .update({
        session_type: body.session_type,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        name: body.name,
        location: body.location,
        notes: body.notes,
      })
      .eq('id', resolvedParams.scheduleId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Update successful:', data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: error.message,
      details: error 
    }, { status: 500 })
  }
}

// Delete a schedule item
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    
    const { error } = await supabase
      .from('production_schedule')
      .delete()
      .eq('id', resolvedParams.scheduleId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
