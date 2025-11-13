'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link2, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function PublicToggleControls({ showId, initialIsPublic }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [copySuccess, setCopySuccess] = useState(false)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const handleTogglePublic = async (checked) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('shows')
        .update({ is_public: checked })
        .eq('id', showId)

      if (error) throw error

      setIsPublic(checked)
    } catch (error) {
      console.error('Error toggling public status:', error)
      alert('Failed to update public status')
    } finally {
      setUpdating(false)
    }
  }

  const handleCopyPublicLink = async () => {
    const publicUrl = `${window.location.origin}/public/shows/${showId}/schedule`
    
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy link')
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Public Access</span>
              {isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPublic 
                ? 'Anyone with the link can view this schedule'
                : 'Only logged-in users can view this schedule'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPublicLink}
              className="gap-2"
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          )}
          <Switch
            checked={isPublic}
            onCheckedChange={handleTogglePublic}
            disabled={updating}
          />
        </div>
      </div>
    </Card>
  )
}