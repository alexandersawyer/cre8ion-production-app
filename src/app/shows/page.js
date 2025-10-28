'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NewShowForm from '@/components/NewShowForm'

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Shows</h1>
            <p className="text-gray-600">Manage your production schedules, labor, and equipment</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add New Show
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-500">Loading shows...</div>
        )}

        {/* Shows Grid */}
        {!loading && shows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No shows yet. Create your first one!</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-cre8ion-blue text-white rounded-lg hover:bg-blue-700"
            >
              + Add New Show
            </button>
          </div>
        )}

        {!loading && shows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <Link 
                key={show.id}
                href={`/shows/${show.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">{show.show_shortcode}</div>
                  <h2 className="text-xl font-semibold text-gray-900">{show.name}</h2>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">📅</span>
                    <span>{show.start_date} - {show.end_date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">📍</span>
                    <span>{show.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">🏢</span>
                    <span>{show.venue_name}</span>
                  </div>
                </div>

                <div className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center">
                  View Details
                </div>
              </Link>
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