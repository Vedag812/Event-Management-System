'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-400 shadow-sm" />
          <span className="text-sm font-semibold tracking-wide text-foreground">EventFlow Pro</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-4 text-sm text-muted-foreground md:flex">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
          <Link href="/dashboard/create-event" className="transition-colors hover:text-foreground">Create Event</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="border-indigo-200/60 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-200 dark:hover:bg-indigo-500/10">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent dark:via-indigo-500/30" />
    </header>
  )
}


