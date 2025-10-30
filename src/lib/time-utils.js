// Convert 24hr time string to 12hr format
export function format24hrTo12hr(time24) {
  if (!time24) return ''
  
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  
  return `${hour12}:${minutes} ${ampm}`
}

// Convert 12hr time string to 24hr format
export function format12hrTo24hr(time12) {
  if (!time12) return ''
  
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return time12 // If it doesn't match, assume it's already 24hr
  
  let [, hours, minutes, period] = match
  hours = parseInt(hours)
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

// Format time based on user preference
export function formatTime(time24, use24hr = true) {
  if (!time24) return ''
  return use24hr ? time24 : format24hrTo12hr(time24)
}