import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import ProductionScheduleTable from '@/components/ProductionScheduleTable'
import { PublicToggleControls } from '@/components/PublicToggleControls'
import { getTimezoneAbbr, getCurrentTimeInTimezone } from '@/lib/timezones'

export const revalidate = 0

export default async function ProductionSchedulePage({ params }) {
  // Await params for Next.js 15
  const resolvedParams = await params
  
  // Fetch the show
  const { data: show } = await supabase
    .from('shows')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

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

  // Extract year from show dates for the date picker
  // Priority: travel_start_date > start_date > current year
  const showYear = show?.travel_start_date 
    ? new Date(show.travel_start_date).getFullYear()
    : show?.start_date
    ? new Date(show.start_date).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Sidebar Trigger + Breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/shows">Shows</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/shows/${resolvedParams.id}`}>
                {show?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Production Schedule</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {show?.show_shortcode ? `${show.show_shortcode} ` : ''}Schedule
            </h1>
            <p className="text-muted-foreground mt-1">
              All times {show?.timezone ? getTimezoneAbbr(show.timezone) : 'Local Time'}
              {show?.timezone && ` | Current Local Time: ${getCurrentTimeInTimezone(show.timezone)}`}
            </p>
          </div>

          {/* Public Access Toggle */}
          <div className="mb-6">
            <PublicToggleControls 
              showId={resolvedParams.id} 
              initialIsPublic={show?.is_public || false}
            />
          </div>

          {/* Pass data to Client Component */}
          <ProductionScheduleTable 
            scheduleItems={scheduleItems || []} 
            showId={resolvedParams.id}
            showYear={showYear}
          />
        </div>
      </div>
    </div>
  )
}