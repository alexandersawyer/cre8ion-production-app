// Format date as "WED 10/16"
export function formatScheduleDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString + 'T00:00:00') // Ensure local timezone
  
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dayOfWeek = dayNames[date.getDay()]
  
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${dayOfWeek} ${month}/${day}`
}

// Format date as full header "WEDNESDAY, OCTOBER 16"
export function formatScheduleDateHeader(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString + 'T00:00:00')
  
  const options = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }
  
  return date.toLocaleDateString('en-US', options).toUpperCase()
}

// Group schedule items by date
export function groupScheduleItemsByDate(items) {
  const grouped = {}
  
  items.forEach(item => {
    const date = item.date
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(item)
  })
  
  // Return as array sorted by date
  return Object.keys(grouped)
    .sort()
    .map(date => ({
      date,
      items: grouped[date]
    }))
}

/**
 * Format a date string from YYYY-MM-DD to readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date like "October 15, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString + 'T00:00:00') // Add time to avoid timezone issues
  const options = { month: 'long', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format a date range with smart year handling
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} - Formatted range like "October 15 - October 18, 2026" or "October 15, 2025 - January 3, 2026"
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return ''
  
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
  const startDay = start.getDate()
  const startYear = start.getFullYear()
  
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' })
  const endDay = end.getDate()
  const endYear = end.getFullYear()
  
  // Same year - show year only once at the end
  if (startYear === endYear) {
    // Same month and year
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${startYear}`
    }
    // Different months, same year
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`
  }
  
  // Different years - show full dates
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
}