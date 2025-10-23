"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { AlertCircle, Home, LogIn } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Separate component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState<{
    error: string | null
    message: string
    timestamp: string
  }>({
    error: null,
    message: '',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    const error = searchParams.get('error')
    
    // Log error details for debugging
    console.error('🚨 Auth Error Page - Error occurred:', {
      error,
      searchParams: Object.fromEntries(searchParams.entries()),
      url: window.location.href,
      timestamp: new Date().toISOString()
    })

    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'Configuration': 'There is a problem with the server configuration.',
      'AccessDenied': 'You do not have permission to sign in.',
      'Verification': 'The verification token has expired or has already been used.',
      'OAuthSignin': 'Error in constructing an authorization URL.',
      'OAuthCallback': 'Error in handling the response from an OAuth provider.',
      'OAuthCreateAccount': 'Could not create OAuth provider user in the database.',
      'EmailCreateAccount': 'Could not create email provider user in the database.',
      'Callback': 'Error in the OAuth callback handler route.',
      'OAuthAccountNotLinked': 'Email on the account is already linked, but not with this OAuth account.',
      'EmailSignin': 'Sending the e-mail with the verification token failed.',
      'CredentialsSignin': 'The credentials you entered are incorrect. Please try again.',
      'SessionRequired': 'You must be signed in to access this page.',
      'Default': 'Unable to sign in. Please try again.',
    }

    setErrorDetails({
      error,
      message: error ? (errorMessages[error] || errorMessages['Default']) : errorMessages['Default'],
      timestamp: new Date().toISOString()
    })

    // If it's a redirect loop, log additional info
    if (error === 'Configuration' || error === 'Callback') {
      console.error('🔄 Possible redirect loop detected!')
      console.error('🔍 Check Vercel logs for redirect callback details')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="text-gray-600 mt-2">Something went wrong</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600">
              Unable to Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                Error: {errorDetails.error || 'Unknown'}
              </p>
              <p className="text-sm text-red-700">
                {errorDetails.message}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-mono">
                Timestamp: {errorDetails.timestamp}
              </p>
              {errorDetails.error && (
                <p className="text-xs text-gray-600 font-mono mt-1">
                  Error Code: {errorDetails.error}
                </p>
              )}
            </div>

            {(errorDetails.error === 'Configuration' || errorDetails.error === 'Callback') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Debug Info:</strong> Check Vercel Runtime Logs for detailed error information.
                  This may be a configuration or redirect issue.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-600">
                If this problem persists, please contact support with the error code and timestamp.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading fallback component
function ErrorPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="text-gray-600 mt-2">Loading error details...</p>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorPageLoading />}>
      <AuthErrorContent />
    </Suspense>
  )
}
