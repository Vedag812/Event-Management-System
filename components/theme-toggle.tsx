'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = (mounted ? (resolvedTheme ?? theme) : undefined) === 'dark'

  if (!mounted) {
    // Avoid SSR/CSR mismatch by delaying icon render until mounted
    return (
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 border-indigo-200/60 hover:bg-indigo-50 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10"
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-4 w-4 rounded-full bg-muted-foreground/30" />
      </Button>
    )
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className="h-8 w-8 border-indigo-200/60 hover:bg-indigo-50 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}


