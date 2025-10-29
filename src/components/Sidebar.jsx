'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Home,
  Settings,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Sidebar() {
  const [shows, setShows] = useState([])
  const [expandedShows, setExpandedShows] = useState({})
  const pathname = usePathname()

  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    const { data } = await supabase
      .from('shows')
      .select('*')
      .order('start_date', { ascending: true })
    
    if (data) {
      setShows(data)
      // Auto-expand the currently active show
      const currentShowId = pathname.split('/')[2]
      if (currentShowId) {
        setExpandedShows({ [currentShowId]: true })
      }
    }
  }

  const toggleShow = (showId) => {
    setExpandedShows(prev => ({
      ...prev,
      [showId]: !prev[showId]
    }))
  }

  const isActive = (path) => pathname === path
  const isShowActive = (showId) => pathname.includes(`/shows/${showId}`)

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">cre8ion</h1>
            <p className="text-xs text-muted-foreground">producing app</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Shows Section */}
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Shows
            </h2>
          </div>

          {shows.map((show) => (
            <div key={show.id}>
              {/* Show Header - Collapsible */}
              <button
                onClick={() => toggleShow(show.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isShowActive(show.id)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{show.name}</span>
                </div>
                {expandedShows[show.id] ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </button>

              {/* Show Sub-pages */}
              {expandedShows[show.id] && (
                <div className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                  <Link
                    href={`/shows/${show.id}`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive(`/shows/${show.id}`)
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Home className="w-4 h-4" />
                    <span>Overview</span>
                  </Link>
                  
                  <Link
                    href={`/shows/${show.id}/schedule`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive(`/shows/${show.id}/schedule`)
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </Link>

                  <Link
                    href={`/shows/${show.id}/edit`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive(`/shows/${show.id}/edit`)
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Edit Show</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Menu / Theme Toggle at Bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
              CS
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Cre8ion User</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
