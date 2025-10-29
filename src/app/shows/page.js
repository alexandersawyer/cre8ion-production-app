'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NewShowForm from '@/components/NewShowForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">All Shows</h1>
            <p className="text-muted-foreground">Manage your production schedules, labor, and equipment</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
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
            <Button onClick={() => setShowForm(true)}>
              Add New Show
            </Button>
          </div>
        )}

        {!loading && shows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <Card key={show.id} className="flex flex-col">
                <CardHeader>
                  <CardDescription>{show.show_shortcode}</CardDescription>
                  <CardTitle>{show.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <span className="font-medium mr-2 text-foreground">Dates:</span>
                    <span>{show.start_date} - {show.end_date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2 text-foreground">Location:</span>
                    <span>{show.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2 text-foreground">Venue:</span>
                    <span>{show.venue_name}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/shows/${show.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
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
  )
}
