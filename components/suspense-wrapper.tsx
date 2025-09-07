"use client"

import { Suspense } from "react"
import { PageLoader, CardSkeleton } from "./loading-spinner"

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingText?: string
}

export function SuspenseWrapper({ 
  children, 
  fallback = <PageLoader />, 
  loadingText 
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={loadingText ? <PageLoader text={loadingText} /> : fallback}>
      {children}
    </Suspense>
  )
}

export function CardSuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CardSkeleton />}>
      {children}
    </Suspense>
  )
}
