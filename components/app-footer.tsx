export function AppFooter() {
  return (
    <footer className="mt-12 border-t border-border/50 bg-background/60 pb-8 pt-6 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <p>&copy; {new Date().getFullYear()} EventFlow Pro. All rights reserved.</p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent dark:via-indigo-500/30 md:hidden" />
          <div className="flex items-center gap-4">
            <span className="text-xs">Built with Next.js & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  )
}


