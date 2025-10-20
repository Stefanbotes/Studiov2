
import { Metadata } from 'next'
import Link from 'next/link'
import SchemaBrowser from '@/components/schema-browser'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Schema Library | Studio 2',
  description: 'Explore the foundational schemas that drive behavior and leadership patterns',
}

export default function SchemasPage() {
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
              Dashboard → Schema Library
            </div>
          </div>
          <Link href="/modes">
            <Button variant="outline" size="sm">
              View Mode Library
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Schema Library
        </h1>
        <p className="text-lg text-gray-600">
          Explore the 18 foundational schemas that form the backbone of Studio 2's analysis engine. 
          These schemas combine clinical insights with leadership applications to provide comprehensive 
          understanding of behavioral patterns.
        </p>
      </div>
      
      <SchemaBrowser />
    </div>
  )
}
