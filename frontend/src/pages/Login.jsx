import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AIChat from '@/components/AIChat'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form)
      await login(res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[420px_1fr] items-start">
        <div className="w-full">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-semibold text-lg">SplitSmart</span>
          </div>

          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <h1 className="text-xl font-semibold mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            No account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <div>
          <AIChat
            title="AI Insights Preview"
            description="Ask about spending summaries, balances, and category insights."
          />
        </div>
      </div>
    </div>
  )
}