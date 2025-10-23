
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn, UserCheck } from "lucide-react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🔐 Login attempt starting...', {
        email,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log('🔐 Login result received:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
        timestamp: new Date().toISOString()
      })

      if (result?.error) {
        // Show specific error message
        console.error('❌ Login error details:', {
          error: result.error,
          status: result.status,
          url: result.url,
          timestamp: new Date().toISOString()
        })
        
        if (result.error === 'CredentialsSignin') {
          toast.error("Invalid email or password. Please try again.")
        } else if (result.error.includes('database') || result.error.includes('Database')) {
          toast.error("Database connection error. Please contact support.")
        } else if (result.error === 'Configuration') {
          console.error('🚨 CONFIGURATION ERROR: Check NEXTAUTH_URL and NEXTAUTH_SECRET in Vercel')
          toast.error("Server configuration error. Please contact support.")
        } else if (result.error === 'Callback') {
          console.error('🚨 CALLBACK ERROR: Possible redirect loop detected')
          toast.error("Authentication callback error. Please contact support.")
        } else {
          toast.error(`Authentication failed: ${result.error}`)
        }
      } else if (result?.ok) {
        console.log('✅ Login successful!', {
          status: result.status,
          url: result.url,
          timestamp: new Date().toISOString()
        })
        toast.success("Welcome to Studio 2")
        
        console.log('⏳ Waiting for session cookie to propagate...')
        // Wait longer to ensure session cookie is fully set and propagated
        // This is critical for preventing redirect loops
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('🔀 Redirecting to dashboard...')
        // Use window.location for a hard redirect to ensure session is loaded
        // This forces a full page reload with the new session cookie
        window.location.href = "/dashboard"
      } else {
        console.error('❌ Unexpected login result:', {
          result,
          timestamp: new Date().toISOString()
        })
        toast.error("An unexpected error occurred. Please try again.")
      }
    } catch (error) {
      console.error('❌ Login exception:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      })
      toast.error("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Studio 2</h1>
          <p className="text-gray-600 mt-2">Professional Assessment Platform</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              Access your professional dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@practice.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
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
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
