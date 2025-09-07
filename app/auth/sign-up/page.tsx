"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            organization: organization,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            EventFlow Pro
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Join thousands of event organizers worldwide</p>
        </div>
        
        <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
              Start managing your events like a pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="fullName" className="text-lg font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="organization" className="text-lg font-bold text-slate-700 dark:text-slate-300">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Your Company"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-lg font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-lg font-bold text-slate-700 dark:text-slate-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                {error && <p className="text-lg text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
                <Button type="submit" className="w-full transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-lg">
                <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
                <Link href="/auth/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
