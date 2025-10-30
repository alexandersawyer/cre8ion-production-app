'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TIMEZONES } from '@/lib/timezones'

// Show status options
const SHOW_STATUS_OPTIONS = [
  'Planning',
  'In Preparation',
  'Load In',
  'Live',
  'Load Out',
  'Completed',
  'Cancelled'
]

// Union status options
const UNION_STATUS_OPTIONS = [
  'Union',
  'Non-Union',
  'Mixed'
]

export default function NewShowForm({ onClose }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    show_shortcode: '',
    show_id: '',
    show_status: '',
    
    // Dates
    start_date: '',
    end_date: '',
    travel_start_date: '',
    travel_end_date: '',
    
    // Location
    location: '',
    venue_name: '',
    timezone: 'America/New_York',
    
    // Client & Production
    client_name: '',
    production_company: '',
    attendees: '',
    union_status: '',
    
    // Assets (optional)
    client_logo: '',
    background_image: ''
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value ? parseInt(value) : '') : value
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build submission data, converting empty strings to null
      const submitData = {
        name: formData.name.trim(),
        show_shortcode: formData.show_shortcode.trim() || null,
        show_id: formData.show_id.trim() || null,
        show_status: formData.show_status || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        travel_start_date: formData.travel_start_date || null,
        travel_end_date: formData.travel_end_date || null,
        location: formData.location.trim() || null,
        venue_name: formData.venue_name.trim() || null,
        timezone: formData.timezone || 'America/New_York',
        client_name: formData.client_name.trim() || null,
        production_company: formData.production_company.trim() || null,
        attendees: formData.attendees ? parseInt(formData.attendees) : null,
        union_status: formData.union_status || null,
        client_logo: formData.client_logo.trim() || null,
        background_image: formData.background_image.trim() || null
      }

      console.log('Creating show with data:', submitData)

      const { data, error } = await supabase
        .from('shows')
        .insert([submitData])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Show created successfully:', data)
      router.push(`/shows/${data.id}`)
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error creating show:', error)
      alert(`Error creating show: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="show_shortcode">Show Shortcode</Label>
                  <Input
                    id="show_shortcode"
                    name="show_shortcode"
                    value={formData.show_shortcode}
                    onChange={handleChange}
                    placeholder="IXC001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="show_id">Show ID</Label>
                  <Input
                    id="show_id"
                    name="show_id"
                    value={formData.show_id}
                    onChange={handleChange}
                    placeholder="Custom show ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="show_status">Show Status</Label>
                <Select 
                  value={formData.show_status} 
                  onValueChange={(value) => handleSelectChange('show_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOW_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Dates</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Show Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Show End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travel_start_date">Travel Start Date</Label>
                  <Input
                    id="travel_start_date"
                    type="date"
                    name="travel_start_date"
                    value={formData.travel_start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travel_end_date">Travel End Date</Label>
                  <Input
                    id="travel_end_date"
                    type="date"
                    name="travel_end_date"
                    value={formData.travel_end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
              
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="venue_name">Venue Name</Label>
                  <Input
                    id="venue_name"
                    name="venue_name"
                    value={formData.venue_name}
                    onChange={handleChange}
                    placeholder="Grand Horizon Convention Center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Show Timezone</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => handleSelectChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client & Production Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Client & Production</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="production_company">Production Company</Label>
                  <Input
                    id="production_company"
                    name="production_company"
                    value={formData.production_company}
                    onChange={handleChange}
                    placeholder="Cre8ion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendees">Expected Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleChange}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="union_status">Union Status</Label>
                  <Select 
                    value={formData.union_status} 
                    onValueChange={(value) => handleSelectChange('union_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select union status" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNION_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_logo">Client Logo URL (Optional)</Label>
                <Input
                  id="client_logo"
                  name="client_logo"
                  value={formData.client_logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_image">Background Image URL (Optional)</Label>
                <Input
                  id="background_image"
                  name="background_image"
                  value={formData.background_image}
                  onChange={handleChange}
                  placeholder="https://example.com/background.jpg"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
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