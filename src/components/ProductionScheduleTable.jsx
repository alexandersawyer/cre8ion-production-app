'use client'

import { useState, useEffect } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Clock, Pencil } from 'lucide-react'
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

export default function ProductionScheduleTable({ scheduleItems, showId }) {
  const router = useRouter()
  const [items, setItems] = useState(scheduleItems)
  const [filteredItems, setFilteredItems] = useState(scheduleItems)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isAdding, setIsAdding] = useState(false)
  const [timeFormat, setTimeFormat] = useState('24hr')
  const [showDateHeaders, setShowDateHeaders] = useState(() => {
    // Initialize from localStorage to prevent race condition
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showDateHeaders')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })
  const [savedFilters, setSavedFilters] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  const [newItemForm, setNewItemForm] = useState({
    session_type: 'Session',
    date: '',
    start_time: '',
    end_time: '',
    name: '',
    location: '',
    notes: ''
  })

  // Sort schedule items by date and time - defined early so it can be used in useEffects
  const sortScheduleItems = (itemsToSort) => {
    return [...itemsToSort].sort((a, b) => {
      // First sort by date
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      // Then sort by start time
      return a.start_time.localeCompare(b.start_time)
    })
  }

  // Sort initial items when component mounts or scheduleItems prop changes
  useEffect(() => {
    const sortedItems = sortScheduleItems(scheduleItems)
    setItems(sortedItems)
    setFilteredItems(sortedItems)
  }, [scheduleItems])

  // Load saved filters from Supabase
  useEffect(() => {
    fetchSavedFilters()
  }, [])

  // Load time format preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('timeFormat')
    if (saved) {
      setTimeFormat(saved)
    }
  }, [])

  // Save date headers preference when it changes (but not on initial render)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showDateHeaders', showDateHeaders.toString())
    }
  }, [showDateHeaders])

  // Load active filter from localStorage
  useEffect(() => {
    const savedFilterId = localStorage.getItem('activeFilterId')
    if (savedFilterId && savedFilters.length > 0) {
      const filter = savedFilters.find(f => f.id === parseInt(savedFilterId))
      if (filter) {
        applyFilter(filter)
      }
    } else if (savedFilters.length > 0) {
      // Default to "All Items" filter
      const allItemsFilter = savedFilters.find(f => f.name === 'All Items')
      if (allItemsFilter) {
        applyFilter(allItemsFilter)
      }
    }
  }, [savedFilters, items])

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
    
    // Filter items based on session types
    const filtered = items.filter(item => 
      filter.session_types.includes(item.session_type)
    )
    // Always sort after filtering
    setFilteredItems(sortScheduleItems(filtered))
  }

  const handleTimeFormatChange = (value) => {
    setTimeFormat(value)
    localStorage.setItem('timeFormat', value)
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
  }

  const handleCancelNew = () => {
    setIsAdding(false)
    setNewItemForm({
      session_type: 'Session',
      date: '',
      start_time: '',
      end_time: '',
      name: '',
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
        location: '',
        notes: ''
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error creating:', error)
      alert('Failed to create schedule item')
    }
  }

  // Group filtered items by date
  const groupedItems = groupScheduleItemsByDate(filteredItems)

  return (
    <>
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-6">
        {/* Time Format Toggle */}
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

        {/* Default Filter Buttons */}
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

        {/* Custom Filters + Manage Menu */}
        {(savedFilters.filter(f => !f.is_default).length > 0 || true) && (
          <>
            <div className="h-6 w-px bg-border mx-1" />
            <div className="flex border rounded-md">
              {/* Custom Filters */}
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

              {/* Manage Filters Menu */}
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

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddNew} disabled={isAdding}>
              Add Schedule Item
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDateHeaders(!showDateHeaders)}>
              {showDateHeaders ? '✓ ' : ''}Show Date Headers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Single Continuous Table */}
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
                  <TableHead className="font-medium">Location</TableHead>
                  <TableHead className="font-medium">Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedItems.map(({ date, items: dateItems }, groupIdx) => (
                  <>
                    {/* Date Header Row */}
                    {showDateHeaders && (
                      <TableRow key={`header-${date}`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={8} className="font-semibold">
                          {formatScheduleDateHeader(date)}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Items for this date */}
                    {dateItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50">
                        {editingId === item.id ? (
                          // EDIT MODE
                          <>
                            <TableCell>
                              <input
                                type="date"
                                value={editForm.date || ''}
                                onChange={(e) => 
                                  setEditForm({...editForm, date: e.target.value})
                                }
                                className="w-full px-2 py-1 border rounded"
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
                              <Select
                                value={editForm.session_type || ''}
                                onValueChange={(value) => 
                                  setEditForm({...editForm, session_type: value})
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SESSION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                          // VIEW MODE
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
                  </>
                ))}

                {/* ADD NEW ROW */}
                {isAdding && (
                  <TableRow className="bg-accent/50">
                    <TableCell>
                      <input
                        type="date"
                        value={newItemForm.date}
                        onChange={(e) => 
                          setNewItemForm({...newItemForm, date: e.target.value})
                        }
                        className="w-full px-2 py-1 border rounded"
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
                      <Select
                        value={newItemForm.session_type}
                        onValueChange={(value) => 
                          setNewItemForm({...newItemForm, session_type: value})
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SESSION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                {/* EMPTY STATE */}
                {filteredItems.length === 0 && !isAdding && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell 
                      colSpan={8} 
                      className="h-32 text-center text-muted-foreground"
                    >
                      No schedule items match this filter. Click "Add Schedule Item" to get started.
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