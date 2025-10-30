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
  Sparkles
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function AppSidebar() {
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
    <Sidebar>
      <SidebarHeader>
        <Link href="/shows" className="flex items-center gap-2 px-2 py-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Cre8ionOS</h1>
            <p className="text-xs text-muted-foreground">production management</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Shows</SidebarGroupLabel>
          <SidebarMenu>
            {shows.map((show) => (
              <SidebarMenuItem key={show.id}>
                <SidebarMenuButton
                  onClick={() => toggleShow(show.id)}
                  isActive={isShowActive(show.id)}
                  tooltip={show.name}
                >
                  <Calendar className="w-4 h-4" />
                  <div className="flex items-center gap-2 truncate flex-1">
                    {show.show_shortcode && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {show.show_shortcode}
                      </span>
                    )}
                    <span className="truncate">{show.name}</span>
                  </div>
                  {expandedShows[show.id] ? (
                    <ChevronDown className="ml-auto w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="ml-auto w-4 h-4 flex-shrink-0" />
                  )}
                </SidebarMenuButton>

                {expandedShows[show.id] && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive(`/shows/${show.id}`)}>
                        <Link href={`/shows/${show.id}`}>
                          <Home className="w-4 h-4" />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive(`/shows/${show.id}/schedule`)}>
                        <Link href={`/shows/${show.id}/schedule`}>
                          <Calendar className="w-4 h-4" />
                          <span>Schedule</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                  CS
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">Cre8ion User</p>
                  <p className="text-xs text-muted-foreground truncate">Admin</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}