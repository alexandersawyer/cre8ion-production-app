export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', abbr: 'ET' },
  { value: 'America/Chicago', label: 'Central Time (CT)', abbr: 'CT' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', abbr: 'MT' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', abbr: 'PT' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', abbr: 'MST' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', abbr: 'AKT' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', abbr: 'HT' },
]

// Get current time in a specific timezone
export function getCurrentTimeInTimezone(timezone) {
  if (!timezone) return ''
  
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())
}

// Get timezone abbreviation
export function getTimezoneAbbr(timezone) {
  const tz = TIMEZONES.find(t => t.value === timezone)
  return tz?.abbr || ''
}