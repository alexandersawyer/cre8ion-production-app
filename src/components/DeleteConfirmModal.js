'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Delete Show?</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{itemName}</strong>? This action cannot be undone and will also delete all associated schedule items, labor, and equipment data.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1"
            >
              Yes, Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
