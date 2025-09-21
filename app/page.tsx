'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const justRegistered = search?.get('registered') === '1'

  const [role, setRole] = useState('') // optional selector; server role is the source of truth
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError('Please enter username and password')
      return
    }

    try {
      setLoading(true)

      // 1) Real login against Flask: POST /api/auth/login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // keep credentials in case you later switch to cookie auth
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Login failed (${res.status}): ${msg}`)
      }

      const data: {
        access_token?: string
        role?: string
        user_id?: number | string
      } = await res.json()

      const token = data.access_token
      if (token) {
        localStorage.setItem('token', token)
      }

      // 2) Resolve role — prefer server’s role from login; confirm via /api/auth/role
      let resolvedRole = data.role
      try {
        const roleRes = await fetch('/api/auth/role', {
          method: 'GET',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        })
        if (roleRes.ok) {
          const roleJson = (await roleRes.json()) as { role?: string; user_id?: number | string }
          if (roleJson?.role) resolvedRole = roleJson.role
        }
      } catch {
        // ignore; we’ll fall back to existing value(s)
      }
      // last resort fallback to user’s selection if server didn’t return a role
      resolvedRole = resolvedRole || role

      // 3) Route by resolved role
      switch (resolvedRole) {
        case 'student':
        case 'STUDENT':
          router.push('/student')
          break
        case 'teacher':
        case 'TEACHER':
          router.push('/teacher')
          break
        case 'admin':
        case 'ADMIN':
          router.push('/admin')
          break
        case 'MGMT':
          router.push('/mgmt')
          break
        case 'DEPT':
          router.push('/dept')
          break
        case 'POLICYMAKER':
          router.push('/policymaker')
          break
        default:
          // if unknown, land on home
          router.push('/')
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4 space-y-6">
      {/* Heading section outside the box */}
      <div className="text-center">
        <h1 className="text-4xl font-bold">Attendify</h1>
        <p className="text-sm text-muted-foreground">AI-powered attendance management system</p>
      </div>

      {/* The white card with form stays below */}
      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleLogin} className="space-y-6">
          {justRegistered && (
            <div className="rounded-md bg-green-50 text-green-700 text-sm px-3 py-2 text-center">
              Admin registered successfully. Please log in.
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">User Type (optional)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              disabled={loading}
            >
              <option value="">Select your role (optional)</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
              <option value="MGMT">Management</option>
              <option value="DEPT">Education Dept</option>
              <option value="POLICYMAKER">Policymaker</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              We’ll use the server role if available. This selector is a fallback.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-xs text-center text-gray-500">
            Need public insights? <a href="/dept" className="underline">Education Dept</a> &middot{' '}
            <a href="/policymaker" className="underline">Policymaker</a>
          </p>
          <p className="text-xs text-center text-gray-500">
            Need an account?{' '}
            <a href="/admin/register" className="underline text-blue-600">Register as Admin</a>
          </p>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  // Wrap useSearchParams in Suspense to satisfy Next’s CSR bailout requirement
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <LoginInner />
    </Suspense>
  )
}
