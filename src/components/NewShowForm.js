'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create New Show</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <span className="text-xl leading-none">&times;</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Show Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Show Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="FutureForward Summit 2026"
              />
            </div>

            {/* Show Shortcode */}
            <div className="space-y-2">
              <Label htmlFor="show_shortcode">Show Shortcode *</Label>
              <Input
                id="show_shortcode"
                name="show_shortcode"
                value={formData.show_shortcode}
                onChange={handleChange}
                required
                placeholder="IXC001"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Orlando, FL"
              />
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venue_name">Venue</Label>
              <Input
                id="venue_name"
                name="venue_name"
                value={formData.venue_name}
                onChange={handleChange}
                placeholder="Grand Horizon Convention Center"
              />
            </div>

            {/* Show Status */}
            <div className="space-y-2">
              <Label htmlFor="show_status">Status</Label>
              <select
                id="show_status"
                name="show_status"
                value={formData.show_status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Show'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
