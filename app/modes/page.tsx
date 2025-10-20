
import { Metadata } from 'next'
import Link from 'next/link'
import ModeBrowser from '@/components/mode-browser'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mode Library | Studio 2',
  description: 'Explore schema therapy modes with linked schemas and coping strategies',
}

export default function ModesPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Navigation Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-sm text-gray-500">
              <Home className="inline h-4 w-4 mr-1" />
              Dashboard → Mode Library
            </div>
          </div>
          <Link href="/schemas">
            <Button variant="outline" size="sm">
              View Schema Library
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mode Library
        </h1>
        <p className="text-lg text-gray-600">
          Explore the different emotional and behavioral states (modes) in schema therapy. 
          Each mode represents a specific way of responding to activated schemas, from 
          vulnerable child states to coping mechanisms and healthy adult functioning.
        </p>
      </div>
      
      <ModeBrowser />
    </div>
  )
}
