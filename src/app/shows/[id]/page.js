'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Switch } from '@/components/ui/switch'
import { Link2, Copy, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { formatDateRange } from '@/lib/date-utils'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Common US timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', abbr: 'ET' },
  { value: 'America/Chicago', label: 'Central Time (CT)', abbr: 'CT' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', abbr: 'MT' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', abbr: 'PT' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', abbr: 'MST' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', abbr: 'AKT' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', abbr: 'HT' },
]

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

export default function ShowDetailPage({ params }) {
  // Unwrap the async params
  const resolvedParams = use(params)
  const showId = resolvedParams.id
  
  const router = useRouter()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Edit form state - matches database exactly
  const [editForm, setEditForm] = useState({
    name: '',
    show_shortcode: '',
    show_id: '',
    start_date: '',
    end_date: '',
    location: '',
    venue_name: '',
    timezone: '',
    client_name: '',
    client_logo: '',
    background_image: '',
    show_status: '',
    attendees: '',
    union_status: '',
    travel_start_date: '',
    travel_end_date: '',
    production_company: ''
  })

 useEffect(() => {
    fetchShow()
  }, [showId]) // Keep as is, but we'll fix it differently

  const fetchShow = async () => {
    try {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('id', showId)
        .single()

      if (error) throw error
      
      console.log('Fetched show data:', data)
      setShow(data)
      
      // Initialize edit form with current data
      setEditForm({
        name: data.name || '',
        show_shortcode: data.show_shortcode || '',
        show_id: data.show_id || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        location: data.location || '',
        venue_name: data.venue_name || '',
        timezone: data.timezone || 'America/New_York',
        client_name: data.client_name || '',
        client_logo: data.client_logo || '',
        background_image: data.background_image || '',
        show_status: data.show_status || '',
        attendees: data.attendees?.toString() || '',
        union_status: data.union_status || '',
        travel_start_date: data.travel_start_date || '',
        travel_end_date: data.travel_end_date || '',
        production_company: data.production_company || ''
      })
    } catch (error) {
      console.error('Failed to fetch show:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (show) {
      setEditForm({
        name: show.name || '',
        show_shortcode: show.show_shortcode || '',
        show_id: show.show_id || '',
        start_date: show.start_date || '',
        end_date: show.end_date || '',
        location: show.location || '',
        venue_name: show.venue_name || '',
        timezone: show.timezone || 'America/New_York',
        client_name: show.client_name || '',
        client_logo: show.client_logo || '',
        background_image: show.background_image || '',
        show_status: show.show_status || '',
        attendees: show.attendees?.toString() || '',
        union_status: show.union_status || '',
        travel_start_date: show.travel_start_date || '',
        travel_end_date: show.travel_end_date || '',
        production_company: show.production_company || ''
      })
    }
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      alert('Show name is required')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        name: editForm.name.trim(),
        show_shortcode: editForm.show_shortcode.trim() || null,
        show_id: editForm.show_id.trim() || null,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        location: editForm.location.trim() || null,
        venue_name: editForm.venue_name.trim() || null,
        timezone: editForm.timezone || 'America/New_York',
        client_name: editForm.client_name.trim() || null,
        client_logo: editForm.client_logo.trim() || null,
        background_image: editForm.background_image.trim() || null,
        show_status: editForm.show_status || null,
        attendees: editForm.attendees ? parseInt(editForm.attendees) : null,
        union_status: editForm.union_status || null,
        travel_start_date: editForm.travel_start_date || null,
        travel_end_date: editForm.travel_end_date || null,
        production_company: editForm.production_company.trim() || null
      }

      console.log('Updating show with data:', updateData)

      const { data, error } = await supabase
        .from('shows')
        .update(updateData)
        .eq('id', showId)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Update successful:', data)
      await fetchShow()
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating show:', error)
      alert(`Failed to update show: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', showId)

      if (error) throw error

      router.push('/shows')
      router.refresh()
    } catch (error) {
      console.error('Error deleting show:', error)
      alert('Error deleting show. Please try again.')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleTogglePublic = async (checked) => {
  try {
    const { error } = await supabase
      .from('shows')
      .update({ is_public: checked })
      .eq('id', showId)

    if (error) throw error

    await fetchShow()
  } catch (error) {
    console.error('Error toggling public status:', error)
    alert('Failed to update public status')
  }
}

const handleCopyPublicLink = async () => {
  const publicUrl = `${window.location.origin}/public/shows/${showId}/schedule`
  
  try {
    await navigator.clipboard.writeText(publicUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
    alert('Failed to copy link')
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
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Show not found</p>
          <Button onClick={() => router.push('/shows')}>Back to Shows</Button>
        </div>
      </div>
    )
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
              <BreadcrumbLink href="/shows">Shows</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{show?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Show Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                {isEditing ? (
                  // Edit Mode
                  <div className="flex-1 space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Show Name *</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Enter show name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shortcode">Show Shortcode</Label>
                          <Input
                            id="shortcode"
                            value={editForm.show_shortcode}
                            onChange={(e) => setEditForm({ ...editForm, show_shortcode: e.target.value })}
                            placeholder="e.g. ABC2025"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="show_id">Show ID</Label>
                          <Input
                            id="show_id"
                            value={editForm.show_id}
                            onChange={(e) => setEditForm({ ...editForm, show_id: e.target.value })}
                            placeholder="Custom show ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="show_status">Show Status</Label>
                          <Select
                            value={editForm.show_status}
                            onValueChange={(value) => setEditForm({ ...editForm, show_status: value })}
                          >
                            <SelectTrigger id="show_status">
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
                    </div>

                    {/* Dates Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dates</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Show Start Date</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={editForm.start_date}
                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date">Show End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={editForm.end_date}
                            onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="travel_start_date">Travel Start Date</Label>
                          <Input
                            id="travel_start_date"
                            type="date"
                            value={editForm.travel_start_date}
                            onChange={(e) => setEditForm({ ...editForm, travel_start_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="travel_end_date">Travel End Date</Label>
                          <Input
                            id="travel_end_date"
                            type="date"
                            value={editForm.travel_end_date}
                            onChange={(e) => setEditForm({ ...editForm, travel_end_date: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Location</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            placeholder="City, State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="venue_name">Venue Name</Label>
                          <Input
                            id="venue_name"
                            value={editForm.venue_name}
                            onChange={(e) => setEditForm({ ...editForm, venue_name: e.target.value })}
                            placeholder="Venue name"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="timezone">Show Timezone</Label>
                          <Select
                            value={editForm.timezone}
                            onValueChange={(value) => setEditForm({ ...editForm, timezone: value })}
                          >
                            <SelectTrigger id="timezone">
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
                    </div>

                    {/* Client & Production Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Client & Production</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="client_name">Client Name</Label>
                          <Input
                            id="client_name"
                            value={editForm.client_name}
                            onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                            placeholder="Client company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="production_company">Production Company</Label>
                          <Input
                            id="production_company"
                            value={editForm.production_company}
                            onChange={(e) => setEditForm({ ...editForm, production_company: e.target.value })}
                            placeholder="Production company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="attendees">Attendees</Label>
                          <Input
                            id="attendees"
                            type="number"
                            value={editForm.attendees}
                            onChange={(e) => setEditForm({ ...editForm, attendees: e.target.value })}
                            placeholder="Expected number of attendees"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="union_status">Union Status</Label>
                          <Select
                            value={editForm.union_status}
                            onValueChange={(value) => setEditForm({ ...editForm, union_status: value })}
                          >
                            <SelectTrigger id="union_status">
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
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="client_logo">Client Logo URL</Label>
                          <Input
                            id="client_logo"
                            value={editForm.client_logo}
                            onChange={(e) => setEditForm({ ...editForm, client_logo: e.target.value })}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="background_image">Background Image URL</Label>
                          <Input
                            id="background_image"
                            value={editForm.background_image}
                            onChange={(e) => setEditForm({ ...editForm, background_image: e.target.value })}
                            placeholder="https://example.com/background.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveEdit} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {show.show_shortcode && (
                          <CardDescription className="text-base font-mono">{show.show_shortcode}</CardDescription>
                        )}
                        {show.show_status && (
                          <Badge variant="secondary">{show.show_status}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-3xl mb-4">{show.name}</CardTitle>
                      
                      {/* Show Details Grid */}
                      <div className="grid grid-cols-2 gap-x-12 text-sm">
                        {/* Column 1 */}
                        <div className="space-y-3">
                          {show.start_date && show.end_date && (
                            <div>
                              <span className="font-medium text-foreground">Show Dates: </span>
                              <span className="text-muted-foreground">{formatDateRange(show.start_date, show.end_date)}</span>
                            </div>
                          )}
                          {show.travel_start_date && show.travel_end_date && (
                            <div>
                              <span className="font-medium text-foreground">Travel Dates: </span>
                              <span className="text-muted-foreground">{formatDateRange(show.travel_start_date, show.travel_end_date)}</span>
                            </div>
                          )}
                          
                          {/* Divider */}
                          {(show.client_name || show.production_company || show.union_status) && (
                            <div className="border-t pt-3 mt-3" />
                          )}
                          
                          {show.client_name && (
                            <div>
                              <span className="font-medium text-foreground">Client: </span>
                              <span className="text-muted-foreground">{show.client_name}</span>
                            </div>
                          )}
                          {show.production_company && (
                            <div>
                              <span className="font-medium text-foreground">Production Company: </span>
                              <span className="text-muted-foreground">{show.production_company}</span>
                            </div>
                          )}
                          {show.union_status && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">Union Status: </span>
                              <Badge variant="secondary">
                                {show.union_status}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Column 2 */}
                        <div className="space-y-3">
                          {show.location && (
                            <div>
                              <span className="font-medium text-foreground">Location: </span>
                              <span className="text-muted-foreground">{show.location}</span>
                            </div>
                          )}
                          {show.venue_name && (
                            <div>
                              <span className="font-medium text-foreground">Venue: </span>
                              <span className="text-muted-foreground">{show.venue_name}</span>
                            </div>
                          )}
                          {show.timezone && (
                            <div>
                              <span className="font-medium text-foreground">Timezone: </span>
                              <span className="text-muted-foreground">
                                {TIMEZONES.find(tz => tz.value === show.timezone)?.label || show.timezone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-64">
  <DropdownMenuItem onClick={handleEdit}>
    Edit Show
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <div className="px-2 py-2">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4" />
        <span className="text-sm">Public Access</span>
      </div>
      <Switch
        checked={show.is_public || false}
        onCheckedChange={handleTogglePublic}
      />
    </div>
    {show.is_public && (
      <button
        onClick={handleCopyPublicLink}
        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent transition-colors"
      >
        <span className="text-muted-foreground truncate">
          /public/shows/{showId}/schedule
        </span>
        {copySuccess ? (
          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
        ) : (
          <Copy className="h-3 w-3 flex-shrink-0" />
        )}
      </button>
    )}
  </div>
  <DropdownMenuSeparator />
  <DropdownMenuItem
    onClick={() => setShowDeleteDialog(true)}
    className="text-destructive focus:text-destructive"
  >
    Delete Show
  </DropdownMenuItem>
</DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Navigation Cards - Only show when not editing */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href={`/shows/${show.id}/schedule`} className="group">
                <Card className="h-full hover:border-foreground/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="group-hover:text-foreground transition-colors">
                      Production Schedule
                    </CardTitle>
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
          )}
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              show &quot;{show.name}&quot; and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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