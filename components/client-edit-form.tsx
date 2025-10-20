
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { thresholds } from "@/config/thresholds"

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  role?: string | null
  ageRange?: string | null
  aspirations?: string | null
  pseudonym?: string | null
  isActive: boolean
}

interface ClientEditFormProps {
  client: Client
}

export function ClientEditForm({ client }: ClientEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email || "",
    phone: client.phone || "",
    role: client.role || "",
    ageRange: client.ageRange || "",
    aspirations: client.aspirations || "",
    pseudonym: client.pseudonym || "",
    isActive: client.isActive
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to update client")
      }

      toast.success("Client updated successfully!")
      router.push(`/clients/${client.id}`)
      router.refresh()
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update client")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/clients/${client.id}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Client
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Professional Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  placeholder="e.g., Senior Manager, Director, VP"
                />
              </div>
              
              <div>
                <Label htmlFor="ageRange">Age Range</Label>
                <Select value={formData.ageRange} onValueChange={(value) => handleChange("ageRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20-29">20-29</SelectItem>
                    <SelectItem value="30-39">30-39</SelectItem>
                    <SelectItem value="40-49">40-49</SelectItem>
                    <SelectItem value="50-59">50-59</SelectItem>
                    <SelectItem value="60+">{thresholds.active}+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <Label htmlFor="pseudonym">Pseudonym (for privacy)</Label>
              <Input
                id="pseudonym"
                value={formData.pseudonym}
                onChange={(e) => handleChange("pseudonym", e.target.value)}
                placeholder="Optional pseudonym for reports"
              />
            </div>

            {/* Aspirations */}
            <div>
              <Label htmlFor="aspirations">Career Aspirations & Development Goals</Label>
              <Textarea
                id="aspirations"
                value={formData.aspirations}
                onChange={(e) => handleChange("aspirations", e.target.value)}
                placeholder="Describe the client's career goals, development areas, and aspirations..."
                className="min-h-[100px]"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active Client</Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href={`/clients/${client.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
