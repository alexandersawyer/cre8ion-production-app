'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ShowDetailPage({ params }) {
  const router = useRouter()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch show data
  useEffect(() => {
    fetchShow()
  }, [params.id])

  const fetchShow = async () => {
    const { data, error } = await supabase
      .from('shows')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching show:', error)
    } else {
      setShow(data)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      // Success! Redirect to shows list
      router.push('/shows')
      router.refresh()
    } catch (error) {
      console.error('Error deleting show:', error)
      alert('Error deleting show. Please try again.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Show not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Show Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>{show.show_shortcode}</CardDescription>
                <CardTitle className="text-3xl mb-4">{show.name}</CardTitle>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Dates: </span>
                    {show.start_date} - {show.end_date}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Location: </span>
                    {show.location}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Venue: </span>
                    {show.venue}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  Edit Show
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="destructive"
                >
                  Delete Show
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href={`/shows/${show.id}/schedule`}
            className="group"
          >
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">Production Schedule</CardTitle>
                <CardDescription>Manage session timings and production flow</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Labor
                <Badge variant="secondary">Coming soon</Badge>
              </CardTitle>
              <CardDescription>Assign crew and manage staffing</CardDescription>
            </CardHeader>
          </Card>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Equipment
                <Badge variant="secondary">Coming soon</Badge>
              </CardTitle>
              <CardDescription>Track gear and technical requirements</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={show.name}
      />

      {/* Loading overlay during delete */}
      {deleting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8">
            <p className="text-lg text-foreground">Deleting show...</p>
          </Card>
        </div>
      )}
    </div>
  )
}
