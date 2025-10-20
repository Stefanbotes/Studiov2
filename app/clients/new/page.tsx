
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { thresholds } from "@/config/thresholds"

export default function NewClientPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    ageRange: "",
    aspirations: "",
    pseudonym: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response?.ok) {
        const { client } = await response.json()
        toast.success("Client created successfully!")
        router.push(`/clients/${client?.id}`)
      } else {
        const error = await response.json()
        toast.error(error?.error || "Failed to create client")
      }
    } catch (error) {
      toast.error("An error occurred while creating the client")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Client Profile</h1>
          <p className="text-gray-600 mt-1">Create a new client profile for assessment tracking</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData?.firstName}
                  onChange={(e) => updateFormData("firstName", e?.target?.value || "")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData?.lastName}
                  onChange={(e) => updateFormData("lastName", e?.target?.value || "")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pseudonym">Pseudonym (Optional)</Label>
              <Input
                id="pseudonym"
                placeholder="Optional pseudonym for privacy"
                value={formData?.pseudonym}
                onChange={(e) => updateFormData("pseudonym", e?.target?.value || "")}
              />
              <p className="text-xs text-gray-500">
                Use a pseudonym to maintain client confidentiality in documentation
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@email.com"
                  value={formData?.email}
                  onChange={(e) => updateFormData("email", e?.target?.value || "")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={formData?.phone}
                  onChange={(e) => updateFormData("phone", e?.target?.value || "")}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Professional Role</Label>
                <Select onValueChange={(value) => updateFormData("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                    <SelectItem value="Individual Contributor">Individual Contributor</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <Select onValueChange={(value) => updateFormData("ageRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20-25">20-25</SelectItem>
                    <SelectItem value="26-30">26-30</SelectItem>
                    <SelectItem value="31-35">31-35</SelectItem>
                    <SelectItem value="36-40">36-40</SelectItem>
                    <SelectItem value="41-45">41-45</SelectItem>
                    <SelectItem value="46-50">46-50</SelectItem>
                    <SelectItem value="51-55">51-55</SelectItem>
                    <SelectItem value="56-60">56-60</SelectItem>
                    <SelectItem value="60+">{thresholds.active}+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Development Goals */}
            <div className="space-y-2">
              <Label htmlFor="aspirations">Development Goals & Aspirations</Label>
              <Textarea
                id="aspirations"
                placeholder="Describe the client's career goals, development areas, and aspirations..."
                value={formData?.aspirations}
                onChange={(e) => updateFormData("aspirations", e?.target?.value || "")}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                This information helps contextualize assessment results and guide coaching interventions
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Creating..." : "Create Client"}
              </Button>
              <Link href="/clients">
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
