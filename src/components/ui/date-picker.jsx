"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ value, onValueChange, defaultYear, className }) {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef(null)
  
  // Parse the date string (YYYY-MM-DD) to Date object
  let dateValue
  try {
    dateValue = value ? new Date(value + 'T00:00:00') : undefined
  } catch {
    dateValue = undefined
  }
  
  // Format for display
  const displayValue = dateValue ? format(dateValue, "MM/dd/yyyy") : ""
  
  // Set default month to show based on the selected date, or defaultYear, or current date
  const defaultMonth = React.useMemo(() => {
    if (dateValue) {
      return dateValue
    } else if (defaultYear) {
      return new Date(defaultYear, 0, 1)
    } else {
      return new Date()
    }
  }, [dateValue, defaultYear])

  const handleSelect = (date) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formatted = `${year}-${month}-${day}`
      onValueChange(formatted)
      setOpen(false)
    }
  }
  
  const handleInputChange = (e) => {
    const val = e.target.value
    
    // Allow user to type freely - don't interfere with cursor
    // Only try to parse when they're done (on blur)
    
    // Just update the input value in the DOM directly
    // Don't trigger React re-renders while typing
  }
  
  const handleInputBlur = (e) => {
    const val = e.target.value
    
    // Try to parse the input as a date when user leaves the field
    const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/
    const match = val.match(dateRegex)
    
    if (match) {
      let [, month, day, year] = match
      
      // Handle 2-digit years
      if (year.length === 2) {
        year = '20' + year
      }
      
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      // Validate the date is real
      if (
        parsedDate.getFullYear() === parseInt(year) &&
        parsedDate.getMonth() === parseInt(month) - 1 &&
        parsedDate.getDate() === parseInt(day)
      ) {
        const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        onValueChange(formatted)
        return
      }
    }
    
    // If input is invalid or empty, keep what they typed
    // The input will reset to the proper format if they had a valid date
    if (!val) {
      onValueChange('')
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        key={value} // Force re-render when value changes from calendar
        defaultValue={displayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="MM/DD/YYYY"
        className={cn(
          "pr-10",
          !value && "text-muted-foreground"
        )}
      />
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent pointer-events-auto"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start" 
        side="bottom"
        sideOffset={4}
        style={{ zIndex: 9999 }}
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={defaultMonth}
          initialFocus
          fromYear={defaultYear ? defaultYear - 5 : 1900}
          toYear={defaultYear ? defaultYear + 5 : 2100}
        />
      </PopoverContent>
      </Popover>
    </div>
  )
}