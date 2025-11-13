'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
  ChevronDown, 
  ChevronRight,
  Calendar, 
  Home,
  Mountain,
  LogOut,
  User
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function AppSidebar() {
  const [shows, setShows] = useState([])
  const [expandedShows, setExpandedShows] = useState({})
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchShows()
    fetchUser()
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

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleShow = (showId) => {
    setExpandedShows(prev => ({
      ...prev,
      [showId]: !prev[showId]
    }))
  }

  const isActive = (path) => pathname === path
  const isShowActive = (showId) => pathname.includes(`/shows/${showId}`)

  // Get initials from full name or email
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/shows" className="flex items-center gap-2 px-2 py-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Mountain className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">cre8ionOS</h1>
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
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-auto py-2 flex-1">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.full_name || user?.email || 'User'}
                  </p>
                  {profile?.role && (
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      {profile.role}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronDown className="ml-auto w-4 h-4 flex-shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
    </Sidebar>
  )
}