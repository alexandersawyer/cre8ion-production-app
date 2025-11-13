"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ value, onValueChange, defaultYear, className }) {
  const [open, setOpen] = React.useState(false)
  
  // Parse the date string (YYYY-MM-DD) to Date object
  let dateValue
  try {
    dateValue = value ? new Date(value + 'T00:00:00') : undefined
  } catch {
    dateValue = undefined
  }
  
  // Set default month to show based on defaultYear
  const defaultMonth = defaultYear 
    ? new Date(defaultYear, 0, 1) 
    : new Date()

  const handleSelect = (date) => {
    if (date) {
      // Format as YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formatted = `${year}-${month}-${day}`
      onValueChange(formatted)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value && dateValue ? format(dateValue, "MMM dd, yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={defaultMonth}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}