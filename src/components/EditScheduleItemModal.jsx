'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'

const SESSION_TYPES = [
  'Load-in',
  'Load-out',
  'Session',
  'Rehearsal',
  'Doors',
  'Breakout',
  'Meal',
  'Crew Call/Wrap',
  'Speaker Call',
  'Travel',
  'Hold',
  'Cancelled'
]

const CREW_OPTIONS = [
  'Breakouts',
  'Cre8ion',
  'Featured',
  'Main Stage',
  'Reception / Parties',
  'Second Stage'
]

export function EditScheduleItemModal({ 
  item, 
  open, 
  onOpenChange, 
  onSave,
  onDelete,
  defaultYear 
}) {
  const [formData, setFormData] = useState({
    session_type: '',
    date: '',
    start_time: '',
    end_time: '',
    name: '',
    crew: '',
    location: '',
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        session_type: item.session_type || '',
        date: item.date || '',
        start_time: item.start_time || '',
        end_time: item.end_time || '',
        name: item.name || '',
        crew: item.crew || '',
        location: item.location || '',
        notes: item.notes || ''
      })
    }
  }, [item])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving:', error)
      alert(`Failed to save: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndDuplicate = async () => {
    setIsSaving(true)
    try {
      await onSave(formData, true) // Pass true to indicate duplicate
      // Reset only the name and notes fields, keep everything else
      setFormData(prev => ({
        ...prev,
        name: '',
        notes: ''
      }))
    } catch (error) {
      console.error('Error saving and duplicating:', error)
      alert(`Failed to save: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    try {
      await onDelete(item.id)
      setShowDeleteConfirm(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting:', error)
      alert(`Failed to delete: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>{item?.id ? 'Edit Schedule Item' : 'Add Schedule Item'}</DialogTitle>
          <DialogDescription>
            {item?.id ? 'Make changes to the schedule item.' : 'Create a new schedule item.'} Press Cmd+Enter to save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Row 1: Date, Start Time, End Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={formData.date}
                onValueChange={(date) => setFormData({ ...formData, date })}
                defaultYear={defaultYear}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter session name"
            />
          </div>

          {/* Row 3: Session Type, Crew */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type</Label>
              <Combobox
                options={SESSION_TYPES}
                value={formData.session_type}
                onValueChange={(value) => setFormData({ ...formData, session_type: value })}
                placeholder="Select type"
                searchPlaceholder="Search types..."
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crew">Crew</Label>
              <Combobox
                options={CREW_OPTIONS}
                value={formData.crew}
                onValueChange={(value) => setFormData({ ...formData, crew: value })}
                placeholder="Select crew"
                searchPlaceholder="Search crews..."
                className="w-full"
              />
            </div>
          </div>

          {/* Row 4: Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />
          </div>

          {/* Row 5: Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes or special instructions..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes.length} characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {item?.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAndDuplicate}
            disabled={isSaving}
          >
            Save & Duplicate
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Schedule Item?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formData.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}