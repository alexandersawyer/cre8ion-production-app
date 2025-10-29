import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    .from('schedule_items')
    .select('*')
    .eq('show_id', resolvedParams.id)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching schedule:', error)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/shows" className="hover:text-primary transition-colors">
            Shows
          </Link>
          {' > '}
          <Link href={`/shows/${resolvedParams.id}`} className="hover:text-primary transition-colors">
            {show?.name}
          </Link>
          {' > '}
          <span className="text-foreground font-medium">Production Schedule</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Production Schedule</h1>
            <p className="text-muted-foreground mt-1">
              {show?.name} ({show?.code})
            </p>
          </div>
          <Button className="bg-[#009FE3] hover:bg-[#009FE3]/90 text-white">
            Add Schedule Item
          </Button>
        </div>

        {/* Schedule Table */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Start Time</TableHead>
                    <TableHead className="font-medium">End Time</TableHead>
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Location</TableHead>
                    <TableHead className="font-medium">Notes</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleItems && scheduleItems.length > 0 ? (
                    scheduleItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell className="text-muted-foreground">{item.start_time}</TableCell>
                        <TableCell className="text-muted-foreground">{item.end_time}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.location}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[300px] truncate">
                          {item.notes}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-accent"
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell 
                        colSpan={7} 
                        className="h-32 text-center text-muted-foreground"
                      >
                        No schedule items yet. Click "Add Schedule Item" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {scheduleItems && scheduleItems.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Items
                </CardTitle>
                <div className="text-3xl font-bold text-foreground mt-2">
                  {scheduleItems.length}
                </div>
              </CardHeader>
            </Card>
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique Dates
                </CardTitle>
                <div className="text-3xl font-bold text-foreground mt-2">
                  {new Set(scheduleItems.map(item => item.date)).size}
                </div>
              </CardHeader>
            </Card>
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Locations
                </CardTitle>
                <div className="text-3xl font-bold text-foreground mt-2">
                  {new Set(scheduleItems.map(item => item.location)).size}
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}