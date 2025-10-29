"use client"

import * as React from "react"
import { ThemeToggle } from "./theme-toggle"

export function UserMenu() {
  return (
    <div className="flex items-center justify-between p-4 border-t border-border">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
          CS
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Cre8ion User</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}
