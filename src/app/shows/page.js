'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import NewShowForm from '@/components/NewShowForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateRange } from '@/lib/date-utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export default function ShowsPage() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Fetch shows
  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('shows')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching shows:', error)
    } else {
      setShows(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Sidebar Trigger + Breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Shows</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">All Shows</h1>
              <p className="text-muted-foreground">Manage your production schedules, labor, and equipment</p>
            </div>
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Add New Show
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-muted-foreground">Loading shows...</div>
          )}

          {/* Shows Grid */}
          {!loading && shows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No shows yet. Create your first one!</p>
              <Button variant="outline" onClick={() => setShowForm(true)}>
                Add New Show
              </Button>
            </div>
          )}

          {!loading && shows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shows.map((show) => (
                <Card key={show.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <CardDescription className="font-mono">{show.show_shortcode}</CardDescription>
                      {show.show_status && (
                        <Badge variant="secondary" className="text-xs">
                          {show.show_status}
                        </Badge>
                      )}
                    </div>
                    <CardTitle>{show.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                    {show.start_date && show.end_date && (
                      <div>
                        <span className="font-medium text-foreground">Dates: </span>
                        <span>{formatDateRange(show.start_date, show.end_date)}</span>
                      </div>
                    )}
                    {show.location && (
                      <div>
                        <span className="font-medium text-foreground">Location: </span>
                        <span>{show.location}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
  <Button 
    variant="outline" 
    className="w-full bg-foreground text-background hover:opacity-90 transition-opacity"
    onClick={() => {
      console.log('Navigating to:', `/shows/${show.id}`)
      window.location.href = `/shows/${show.id}`
    }}
  >
    View Details
  </Button>
</CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* New Show Form Modal */}
          {showForm && (
            <NewShowForm
              onClose={() => {
                setShowForm(false)
                fetchShows() // Refresh the list
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}