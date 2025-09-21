"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, User, Lock, UserCheck } from "lucide-react"

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base || base.length === 0) {
    return null
  }
  return base.endsWith("/") ? base.slice(0, -1) : base
}

type LoginFormProps = {
  redirectTo?: string | null
}

export function LoginForm({ redirectTo }: LoginFormProps = {}) {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<string | undefined>(undefined)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const returnToParam = searchParams.get("returnTo")
    const resolvedReturnTo = redirectTo ?? returnToParam
    const safeReturnTo = resolvedReturnTo && resolvedReturnTo.startsWith("/") ? resolvedReturnTo : null

    if (disableAuth) {
      const destination =
        safeReturnTo ??
        (userType === "teacher"
          ? "/teacher"
          : userType === "student"
          ? "/student"
          : userType === "admin"
          ? "/admin"
          : "/")

      router.replace(destination)
      setIsLoading(false)
      return
    }

    const endpointBase = getApiBase()
    const loginUrl = endpointBase ? `${endpointBase}/auth/login` : "/api/auth/login"

    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        credentials: "include", // include cookies for backend JWT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: userType,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || "Login failed")
      }

      await res.json().catch(() => ({}))

      if (safeReturnTo) {
        router.replace(safeReturnTo)
        return
      }

      switch (userType) {
        case "teacher":
          router.replace("/teacher")
          break
        case "student":
          router.replace("/student")
          break
        case "admin":
          router.replace("/admin")
          break
        default:
          router.replace("/")
          break
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err?.message || "Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select value={userType} onValueChange={setUserType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Teacher
                  </div>
                </SelectItem>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Student
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
