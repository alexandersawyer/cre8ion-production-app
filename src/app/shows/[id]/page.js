'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

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
    return <div className="p-8">Loading...</div>
  }

  if (!show) {
    return <div className="p-8">Show not found</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Show Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">{show.show_shortcode}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{show.name}</h1>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>📅 {show.start_date} - {show.end_date}</span>
                <span>📍 {show.location}</span>
                <span>🏢 {show.venue}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-cre8ion-blue text-white rounded hover:bg-cre8ion-dark-blue transition-colors"
              >
                Edit Show
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Show
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href={`/shows/${show.id}/schedule`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <div className="text-4xl mb-3">📅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Production Schedule</h2>
            <p className="text-sm text-gray-600">Manage session timings and production flow</p>
          </Link>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 opacity-50 cursor-not-allowed">
            <div className="text-4xl mb-3">👥</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Labor</h2>
            <p className="text-sm text-gray-600">Assign crew and manage staffing</p>
            <span className="text-xs text-gray-500 mt-2 block">Coming soon</span>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 opacity-50 cursor-not-allowed">
            <div className="text-4xl mb-3">🎬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Equipment</h2>
            <p className="text-sm text-gray-600">Track gear and technical requirements</p>
            <span className="text-xs text-gray-500 mt-2 block">Coming soon</span>
          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8">
            <p className="text-lg">Deleting show...</p>
          </div>
        </div>
      )}
    </div>
  )
}