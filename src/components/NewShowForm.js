'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewShowForm({ onClose }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    show_shortcode: '',
    start_date: '',
    end_date: '',
    location: '',
    venue_name: '',
    show_status: 'onboarding'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  console.log('Form data being submitted:', formData)

  try {
    const { data, error } = await supabase
      .from('shows')
      .insert([formData])
      .select()
      .single()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error details:', error)
      throw error
    }

    // Success! Redirect to the new show's page
    console.log('Show created successfully:', data)
    router.push(`/shows/${data.id}`)
    router.refresh()
    onClose()
  } catch (error) {
    console.error('Caught error:', error)
    alert(`Error creating show: ${error.message || JSON.stringify(error)}`)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Show</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
              placeholder="FutureForward Summit 2026"
            />
          </div>

          {/* Show Shortcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Shortcode *
            </label>
            <input
              type="text"
              name="show_shortcode"
              value={formData.show_shortcode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
              placeholder="IXC001"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
              placeholder="Orlando, FL"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
              placeholder="Grand Horizon Convention Center"
            />
          </div>

          {/* Show Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="show_status"
              value={formData.show_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-cre8ion-blue"
            >
              <option value="onboarding">Onboarding</option>
              <option value="pre-production">Pre-Production</option>
              <option value="production">Production</option>
              <option value="on-site">On-Site</option>
              <option value="post-production">Post-Production</option>
              <option value="offboarding">Offboarding</option>
              <option value="complete">Complete</option>
            </select>
          </div>

        {/* Buttons */}
<div className="flex gap-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
  >
    Cancel
  </button>
  <button
    type="submit"
    disabled={loading}
    className="flex-1 px-4 py-2 bg-[#009FE3] text-white rounded-md hover:bg-[#0088CC] disabled:bg-gray-400 transition-colors"
  >
    {loading ? 'Creating...' : 'Create Show'}
  </button>
</div>

         
        </form>
      </div>
    </div>
  )
}