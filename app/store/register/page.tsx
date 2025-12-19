'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/storefront/Header'
import { useStorefront } from '@/contexts/StorefrontContext'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { setCustomerToken } = useStorefront()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    platform: '',
    platform_id: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const createResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username,
          password: formData.password,
          platform: formData.platform || undefined,
          platform_id: formData.platform_id || undefined,
        }),
      })

      const createResult = await createResponse.json()
      if (!createResult.success) {
        const errorMsg = createResult.error || createResult.details || 'Failed to create account'
        toast.error(errorMsg)
        return
      }

      if (!createResult.data || !createResult.data.id) {
        toast.error('Account created but failed to get customer ID. Please try logging in.')
        return
      }

      const customerId = createResult.data.id

      await new Promise(resolve => setTimeout(resolve, 500))

      const tokenResponse = await fetch(`/api/customers/${customerId}/token`, {
        method: 'POST',
      })

      const tokenResult = await tokenResponse.json()
      if (tokenResult.success && tokenResult.data && tokenResult.data.token) {
        setCustomerToken(tokenResult.data.token)
        toast.success('Account created successfully!')
        setTimeout(() => {
          router.push('/store')
        }, 1000)
      } else {
        toast.error(tokenResult.error || 'Account created but failed to login. Please try logging in manually.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription>Join us and start shopping today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Username *
                </label>
                <Input
                  type="text"
                  id="username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a unique username
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password *
                </label>
                <Input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  minLength={6}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="platform" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Platform (Optional)
                </label>
                <Input
                  type="text"
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="e.g., Steam, Discord"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="platform_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Platform ID (Optional)
                </label>
                <Input
                  type="text"
                  id="platform_id"
                  value={formData.platform_id}
                  onChange={(e) => setFormData({ ...formData, platform_id: e.target.value })}
                  placeholder="Your platform user ID"
                  className="h-11"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 border-t pt-6">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/store/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

