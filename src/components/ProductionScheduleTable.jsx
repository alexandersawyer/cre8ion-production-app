'use client'

import React, { useState, useEffect, useRef } from 'react'  
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Clock, Pencil, Filter, Zap, X, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { formatTime } from '@/lib/time-utils'
import { formatScheduleDate, formatScheduleDateHeader, groupScheduleItemsByDate } from '@/lib/date-utils'

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
  'Everything',
  'Breakouts',
  'Cre8ion',
  'Featured',
  'Main Stage',
  'Reception / Parties',
  'Second Stage'
]

const CREW_EDIT_OPTIONS = [
  'Breakouts',
  'Cre8ion',
  'Featured',
  'Main Stage',
  'Reception / Parties',
  'Second Stage'
]

export default function ProductionScheduleTable({ scheduleItems, showId, showYear }) {
  const router = useRouter()
  const [items, setItems] = useState(scheduleItems)
  const [filteredItems, setFilteredItems] = useState(scheduleItems)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isAdding, setIsAdding] = useState(false)
  const [quickEntryMode, setQuickEntryMode] = useState(false)
  const [timeFormat, setTimeFormat] = useState('24hr')
  const [showDateHeaders, setShowDateHeaders] = useState(true)
  const [savedFilters, setSavedFilters] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  const [quickCrewFilter, setQuickCrewFilter] = useState('all')
  
  const [newItemForm, setNewItemForm] = useState({
    session_type: 'Session',
    date: '',
    start_time: '',
    end_time: '',
    name: '',
    crew: '',
    location: '',
    notes: ''
  })

  const dateInputRef = useRef(null)
  const quickEntryRefs = useRef({})
  const defaultYear = showYear || new Date().getFullYear()

  const sortScheduleItems = (itemsToSort) => {
    return [...itemsToSort].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      return a.start_time.localeCompare(b.start_time)
    })
  }

  useEffect(() => {
    const sortedItems = sortScheduleItems(scheduleItems)
    setItems(sortedItems)
    setFilteredItems(sortedItems)
  }, [scheduleItems])

  useEffect(() => {
    fetchSavedFilters()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('timeFormat')
    if (saved) {
      setTimeFormat(saved)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showDateHeaders')
      if (saved !== null) {
        setShowDateHeaders(saved === 'true')
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showDateHeaders', showDateHeaders.toString())
    }
  }, [showDateHeaders])

  useEffect(() => {
    const savedFilterId = localStorage.getItem('activeFilterId')
    if (savedFilterId && savedFilters.length > 0) {
      const filter = savedFilters.find(f => f.id === parseInt(savedFilterId))
      if (filter) {
        applyFilter(filter)
      }
    } else if (savedFilters.length > 0) {
      const allItemsFilter = savedFilters.find(f => f.name === 'All Items')
      if (allItemsFilter) {
        applyFilter(allItemsFilter)
      }
    }
  }, [savedFilters, items])

  useEffect(() => {
    if (activeFilter) {
      applyFilter(activeFilter)
    }
  }, [quickCrewFilter])

  useEffect(() => {
    if (quickEntryMode && dateInputRef.current) {
      dateInputRef.current.focus()
    }
  }, [quickEntryMode])

  const fetchSavedFilters = async () => {
    const { data } = await supabase
      .from('saved_filters')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (data) {
      setSavedFilters(data)
    }
  }

  const applyFilter = (filter) => {
    setActiveFilter(filter)
    localStorage.setItem('activeFilterId', filter.id.toString())
    
    let filtered = items

    if (filter.session_types && filter.session_types.length > 0) {
      filtered = filtered.filter(item => 
        filter.session_types.includes(item.session_type)
      )
    }

    if (filter.crews && filter.crews.length > 0) {
      filtered = filtered.filter(item => 
        filter.crews.includes(item.crew)
      )
    }

    if (quickCrewFilter !== 'all') {
      filtered = filtered.filter(item => item.crew === quickCrewFilter)
    }

    if (filter.locations && filter.locations.length > 0) {
      filtered = filtered.filter(item => 
        filter.locations.includes(item.location)
      )
    }

    if (filter.date_range_start) {
      filtered = filtered.filter(item => item.date >= filter.date_range_start)
    }
    if (filter.date_range_end) {
      filtered = filtered.filter(item => item.date <= filter.date_range_end)
    }

    setFilteredItems(sortScheduleItems(filtered))
  }

  const handleTimeFormatChange = (value) => {
    setTimeFormat(value)
    localStorage.setItem('timeFormat', value)
  }

  const handleQuickCrewFilter = (value) => {
    setQuickCrewFilter(value)
  }

  const toggleQuickEntryMode = () => {
    setQuickEntryMode(!quickEntryMode)
    if (!quickEntryMode) {
      setIsAdding(false)
    }
  }

  const handleQuickEntryKeyDown = (e, fieldName) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveNewQuick()
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      setQuickEntryMode(false)
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault()
      duplicateLastRow()
      return
    }
  }

  const duplicateLastRow = () => {
    if (items.length === 0) return
    
    const lastItem = items[items.length - 1]
    setNewItemForm({
      session_type: lastItem.session_type,
      date: lastItem.date,
      start_time: lastItem.start_time,
      end_time: lastItem.end_time,
      name: '',
      crew: lastItem.crew,
      location: lastItem.location,
      notes: ''
    })
    
    setTimeout(() => {
      quickEntryRefs.current['name']?.focus()
    }, 0)
  }

  const handleSaveNewQuick = async () => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItemForm,
          show_id: showId
        })
      })

      if (!response.ok) throw new Error('Failed to create')

      const { data } = await response.json()
      
      const updatedItems = sortScheduleItems([...items, data])
      setItems(updatedItems)
      
      const lastDate = newItemForm.date
      const lastCrew = newItemForm.crew
      const lastLocation = newItemForm.location
      
      setNewItemForm({
        session_type: 'Session',
        date: lastDate,
        start_time: '',
        end_time: '',
        name: '',
        crew: lastCrew,
        location: lastLocation,
        notes: ''
      })
      
      setTimeout(() => {
        quickEntryRefs.current['start_time']?.focus()
      }, 0)
      
      router.refresh()
    } catch (error) {
      console.error('Error creating:', error)
      alert('Failed to create schedule item')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm(item)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/schedule/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) throw new Error('Failed to update')

      const { data } = await response.json()
      
      const updatedItems = sortScheduleItems(
        items.map(item => item.id === editingId ? data : item)
      )
      setItems(updatedItems)
      setEditingId(null)
      setEditForm({})
      
      router.refresh()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes')
    }
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setQuickEntryMode(false)
  }

  const handleCancelNew = () => {
    setIsAdding(false)
    setNewItemForm({
      session_type: 'Session',
      date: '',
      start_time: '',
      end_time: '',
      name: '',
      crew: '',
      location: '',
      notes: ''
    })
  }

  const handleSaveNew = async () => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItemForm,
          show_id: showId
        })
      })

      if (!response.ok) throw new Error('Failed to create')

      const { data } = await response.json()
      
      const updatedItems = sortScheduleItems([...items, data])
      setItems(updatedItems)
      setIsAdding(false)
      setNewItemForm({
        session_type: 'Session',
        date: '',
        start_time: '',
        end_time: '',
        name: '',
        crew: '',
        location: '',
        notes: ''
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error creating:', error)
      alert('Failed to create schedule item')
    }
  }

  const groupedItems = groupScheduleItemsByDate(filteredItems)

  return (
    <>
      {quickEntryMode && (
        <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Quick Entry Mode Active
                </span>
              </div>
              <div className="h-4 w-px bg-blue-200 dark:bg-blue-800" />
              <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-1.5">
                  <Kbd>Tab</Kbd>
                  <span>Next field</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd>Enter</Kbd>
                  <span>Save & new</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>D</Kbd>
                  <span>Duplicate last</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd>Esc</Kbd>
                  <span>Exit mode</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleQuickEntryMode}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTimeFormatChange(timeFormat === '12hr' ? '24hr' : '12hr')}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          {timeFormat === '12hr' ? '12hr' : '24hr'}
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex border rounded-md">
          {savedFilters.filter(f => f.is_default).map((filter, idx) => (
            <Button
              key={filter.id}
              onClick={() => applyFilter(filter)}
              variant="ghost"
              size="sm"
              className={`
                ${idx === 0 ? 'rounded-r-none' : idx === savedFilters.filter(f => f.is_default).length - 1 ? 'rounded-l-none' : 'rounded-none'}
                ${activeFilter?.id === filter.id ? 'bg-accent' : ''}
              `}
            >
              {filter.name}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border mx-1" />
        
        <Combobox
          options={CREW_OPTIONS}
          value={quickCrewFilter === 'all' ? 'Everything' : quickCrewFilter}
          onValueChange={(value) => handleQuickCrewFilter(value === 'Everything' ? 'all' : value)}
          placeholder="Filter by crew"
          searchPlaceholder="Search crews..."
          className="w-[160px] h-9"
        />

        {(savedFilters.filter(f => !f.is_default).length > 0 || true) && (
          <>
            <div className="h-6 w-px bg-border mx-1" />
            <div className="flex border rounded-md">
              {savedFilters.filter(f => !f.is_default).map((filter) => (
                <Button
                  key={filter.id}
                  onClick={() => applyFilter(filter)}
                  variant="ghost"
                  size="sm"
                  className={`
                    rounded-none
                    ${activeFilter?.id === filter.id ? 'bg-accent' : ''}
                  `}
                >
                  {filter.name}
                </Button>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={savedFilters.filter(f => !f.is_default).length > 0 ? 'rounded-l-none' : ''}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Create New Filter
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Manage Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddNew} disabled={isAdding || quickEntryMode}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleQuickEntryMode}>
              <Zap className="mr-2 h-4 w-4" />
              {quickEntryMode ? '✓ ' : ''}Quick Entry Mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDateHeaders(!showDateHeaders)}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {showDateHeaders ? '✓ ' : ''}Show Date Headers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Start</TableHead>
                  <TableHead className="font-medium">End</TableHead>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Crew</TableHead>
                  <TableHead className="font-medium">Location</TableHead>
                  <TableHead className="font-medium">Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedItems.map(({ date, items: dateItems }, groupIdx) => (
                  <React.Fragment key={date}>
                    {showDateHeaders && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={9} className="font-semibold">
                          {formatScheduleDateHeader(date)}
                        </TableCell>
                      </TableRow>
                    )}

                    {dateItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50">
                        {editingId === item.id ? (
                          <>
                            <TableCell>
                              <DatePicker
                                value={editForm.date}
                                onValueChange={(date) => setEditForm({...editForm, date})}
                                defaultYear={defaultYear}
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="time"
                                value={editForm.start_time || ''}
                                onChange={(e) => 
                                  setEditForm({...editForm, start_time: e.target.value})
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="time"
                                value={editForm.end_time || ''}
                                onChange={(e) => 
                                  setEditForm({...editForm, end_time: e.target.value})
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => 
                                  setEditForm({...editForm, name: e.target.value})
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <Combobox
                                options={SESSION_TYPES}
                                value={editForm.session_type}
                                onValueChange={(value) => setEditForm({...editForm, session_type: value})}
                                placeholder="Type"
                                searchPlaceholder="Search types..."
                                className="w-[140px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Combobox
                                options={CREW_EDIT_OPTIONS}
                                value={editForm.crew}
                                onValueChange={(value) => setEditForm({...editForm, crew: value})}
                                placeholder="Crew"
                                searchPlaceholder="Search crews..."
                                className="w-[140px]"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={editForm.location || ''}
                                onChange={(e) => 
                                  setEditForm({...editForm, location: e.target.value})
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={editForm.notes || ''}
                                onChange={(e) => 
                                  setEditForm({...editForm, notes: e.target.value})
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={handleSave}
                                  variant="outline"
                                  size="sm"
                                >
                                  Save
                                </Button>
                                <Button 
                                  onClick={handleCancel}
                                  variant="ghost" 
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium text-sm">
                              {formatScheduleDate(item.date)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatTime(item.start_time, timeFormat === '24hr')}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatTime(item.end_time, timeFormat === '24hr')}
                            </TableCell>
                            <TableCell className="text-sm">{item.name}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {item.session_type}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {item.crew}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {item.location}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                              {item.notes}
                            </TableCell>
                            <TableCell>
                              <Button 
                                onClick={() => handleEdit(item)}
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}

                {quickEntryMode && (
                  <TableRow className="bg-blue-50 dark:bg-blue-950/20 border-t-2 border-blue-200 dark:border-blue-900">
                    <TableCell>
                      <DatePicker
                        value={newItemForm.date}
                        onValueChange={(date) => setNewItemForm({...newItemForm, date})}
                        defaultYear={defaultYear}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el) => quickEntryRefs.current['start_time'] = el}
                        type="time"
                        value={newItemForm.start_time}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, start_time: e.target.value})
                        }
                        onKeyDown={(e) => handleQuickEntryKeyDown(e, 'start_time')}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el) => quickEntryRefs.current['end_time'] = el}
                        type="time"
                        value={newItemForm.end_time}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, end_time: e.target.value})
                        }
                        onKeyDown={(e) => handleQuickEntryKeyDown(e, 'end_time')}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el) => quickEntryRefs.current['name'] = el}
                        type="text"
                        value={newItemForm.name}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, name: e.target.value})
                        }
                        onKeyDown={(e) => handleQuickEntryKeyDown(e, 'name')}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Session name"
                      />
                    </TableCell>
                    <TableCell>
                      <Combobox
                        options={SESSION_TYPES}
                        value={newItemForm.session_type}
                        onValueChange={(value) => setNewItemForm({...newItemForm, session_type: value})}
                        placeholder="Type"
                        searchPlaceholder="Search types..."
                        className="w-[140px] focus:ring-2 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Combobox
                        options={CREW_EDIT_OPTIONS}
                        value={newItemForm.crew}
                        onValueChange={(value) => setNewItemForm({...newItemForm, crew: value})}
                        placeholder="Crew"
                        searchPlaceholder="Search crews..."
                        className="w-[140px] focus:ring-2 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el) => quickEntryRefs.current['location'] = el}
                        type="text"
                        value={newItemForm.location}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, location: e.target.value})
                        }
                        onKeyDown={(e) => handleQuickEntryKeyDown(e, 'location')}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Location"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el) => quickEntryRefs.current['notes'] = el}
                        type="text"
                        value={newItemForm.notes}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, notes: e.target.value})
                        }
                        onKeyDown={(e) => handleQuickEntryKeyDown(e, 'notes')}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Notes"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Kbd className="text-[9px]">↵</Kbd>
                        <span>Save</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {isAdding && !quickEntryMode && (
                  <TableRow className="bg-accent/50">
                    <TableCell>
                      <DatePicker
                        value={newItemForm.date}
                        onValueChange={(date) => setNewItemForm({...newItemForm, date})}
                        defaultYear={defaultYear}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="time"
                        value={newItemForm.start_time}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, start_time: e.target.value})
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="time"
                        value={newItemForm.end_time}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, end_time: e.target.value})
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={newItemForm.name}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, name: e.target.value})
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Session name"
                      />
                    </TableCell>
                    <TableCell>
                      <Combobox
                        options={SESSION_TYPES}
                        value={newItemForm.session_type}
                        onValueChange={(value) => setNewItemForm({...newItemForm, session_type: value})}
                        placeholder="Type"
                        searchPlaceholder="Search types..."
                        className="w-[140px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Combobox
                        options={CREW_EDIT_OPTIONS}
                        value={newItemForm.crew}
                        onValueChange={(value) => setNewItemForm({...newItemForm, crew: value})}
                        placeholder="Crew"
                        searchPlaceholder="Search crews..."
                        className="w-[140px]"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={newItemForm.location}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, location: e.target.value})
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Location"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={newItemForm.notes}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, notes: e.target.value})
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Notes"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveNew}
                          variant="outline"
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button 
                          onClick={handleCancelNew}
                          variant="ghost" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {filteredItems.length === 0 && !isAdding && !quickEntryMode && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell 
                      colSpan={9} 
                      className="h-32 text-center text-muted-foreground"
                    >
                      No schedule items match this filter. Click Add Schedule Item to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}