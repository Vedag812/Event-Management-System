"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            EventFlow Pro
          </h1>
        </div>
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "animate-pulse bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50 rounded-lg p-6",
      className
    )}>
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
        </div>
      </div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <CardSkeleton className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2" />
  )
}
