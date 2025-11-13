import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import ProductionScheduleTable from '@/components/ProductionScheduleTable'
import { getTimezoneAbbr, getCurrentTimeInTimezone } from '@/lib/timezones'
import { redirect } from 'next/navigation'

export const revalidate = 0

export default async function PublicSchedulePage({ params }) {
  const resolvedParams = await params
  
  // Fetch the show
  const { data: show } = await supabase
    .from('shows')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  // If show doesn't exist or isn't public, redirect to login
  if (!show || !show.is_public) {
    redirect('/login')
  }

  // Fetch schedule items for this show
  const { data: scheduleItems, error } = await supabase
    .from('production_schedule')
    .select('*')
    .eq('show_id', resolvedParams.id)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching schedule:', error)
  }

  // Extract year from show dates
  const showYear = show?.travel_start_date 
    ? new Date(show.travel_start_date).getFullYear()
    : show?.start_date
    ? new Date(show.start_date).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header without sidebar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background text-sm font-bold">C8</span>
              </div>
              <h1 className="text-lg font-semibold">cre8ionOS</h1>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <div className="flex items-center gap-2">
                {show.show_shortcode && (
                  <span className="text-sm font-mono text-muted-foreground">
                    {show.show_shortcode}
                  </span>
                )}
                <h2 className="text-lg font-semibold">{show.name}</h2>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="text-xs">
              Public View
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Production Schedule
            </h1>
            <p className="text-muted-foreground mt-1">
              All times {show?.timezone ? getTimezoneAbbr(show.timezone) : 'Local Time'}
              {show?.timezone && ` | Current Local Time: ${getCurrentTimeInTimezone(show.timezone)}`}
            </p>
          </div>

          {/* Production Schedule - READ ONLY */}
          <ProductionScheduleTable 
            scheduleItems={scheduleItems || []} 
            showId={resolvedParams.id}
            showYear={showYear}
            isPublicView={true}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm text-muted-foreground">
          <p>Powered by cre8ionOS</p>
        </div>
      </footer>
    </div>
  )
}