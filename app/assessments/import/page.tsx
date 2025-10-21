
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import toast from "react-hot-toast"

interface ClientProfile {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

export default function AssessmentImportPage() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [allowReplace, setAllowReplace] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams?.get("clientId")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (response?.ok) {
          const data = await response.json()
          setClients(data?.clients || [])
          
          // Pre-select client if provided in URL
          if (preselectedClientId) {
            setSelectedClient(preselectedClientId)
          }
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error)
        toast.error("Failed to load clients")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [preselectedClientId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0]
    if (file) {
      // Only accept JSON files
      const isJsonFile = file.type === "application/json" || file.name.toLowerCase().endsWith('.json')
      
      if (!isJsonFile) {
        toast.error("Please select a JSON file")
        return
      }
      if (file?.size > 10 * 1024 * 1024) { // 10MB limit for JSON files
        toast.error("File size must be less than 10MB")
        return
      }
      setSelectedFile(file)
      setImportStatus("idle")
      setErrorMessage("")
    }
  }

  const handleImport = async () => {
    if (!selectedClient || !selectedFile) {
      toast.error("Please select a client and file")
      return
    }

    setImportStatus("uploading")

    try {
      // Client-side validation for JSON files
      const fileContent = await selectedFile.text()
      let jsonData
      
      try {
        jsonData = JSON.parse(fileContent)
      } catch (error) {
        setImportStatus("error")
        setErrorMessage("Invalid JSON file format")
        toast.error("Invalid JSON file format")
        return
      }

      // Basic validation - check for nested structure
      if (!jsonData?.respondent?.id || !jsonData?.assessment?.assessmentId || !jsonData?.assessment?.completedAt) {
        setImportStatus("error")
        setErrorMessage("Missing required fields: respondent.id, assessment.assessmentId, or assessment.completedAt")
        toast.error("Invalid JSON structure - missing required fields")
        return
      }

      setImportStatus("processing")

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("clientId", selectedClient)
      formData.append("allowReplace", allowReplace.toString())

      const response = await fetch("/api/assessments/import", {
        method: "POST",
        body: formData,
      })

      if (response?.ok) {
        const result = await response.json()
        setImportStatus("success")
        
        // Show appropriate success message
        const successMessage = result?.replaced ? 
          "Assessment replaced successfully! Ready for Bridge V2 analysis." :
          "Assessment imported successfully!"
        
        toast.success(successMessage)
        
        // Redirect to client profile after a short delay
        setTimeout(() => {
          router.push(`/clients/${selectedClient}`)
        }, 2500)
      } else {
        const error = await response.json()
        setImportStatus("error")
        
        // Handle duplicate assessment with suggestion
        if (response.status === 409 && error?.suggestion) {
          setErrorMessage(`${error.error}. ${error.suggestion}`)
        } else {
          setErrorMessage(error?.error || "Failed to import data")
        }
        
        toast.error(error?.error || "Failed to import data")
      }
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
      setErrorMessage("An unexpected error occurred during import")
      toast.error("Import failed")
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setImportStatus("idle")
    setErrorMessage("")
    const fileInput = document.getElementById("file-input") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Assessment</h1>
          <p className="text-gray-600 mt-1">Upload JSON assessment file from App A</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5 text-blue-600" />
            Assessment Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Select Client *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client for this assessment" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client?.id} value={client?.id || ""}>
                    {client?.firstName} {client?.lastName}
                    {client?.email && ` (${client.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clients?.length === 0 && (
              <p className="text-sm text-gray-500">
                No clients found. <Link href="/clients/new" className="text-blue-600 hover:underline">Create a client first</Link>
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-input">Assessment Data File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                id="file-input"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FileText className="h-12 w-12 text-gray-400" />
                <div>
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </div>
                <p className="text-sm text-gray-500">JSON files only (max 10MB)</p>
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedFile?.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile?.size / 1024)?.toFixed(1)} KB)
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Replace Option */}
          <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Checkbox
              id="allow-replace"
              checked={allowReplace}
              onCheckedChange={(checked) => setAllowReplace(checked === true)}
            />
            <Label htmlFor="allow-replace" className="text-sm cursor-pointer">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-yellow-600" />
                <span>Replace existing assessment for this client</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Check this if you want to overwrite a previously imported assessment and upgrade to Bridge V2 analysis
              </p>
            </Label>
          </div>

          {/* Status Messages */}
          {importStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {importStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Assessment imported successfully! Redirecting to client profile...
              </AlertDescription>
            </Alert>
          )}

          {/* Import Button */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleImport}
              disabled={!selectedClient || !selectedFile || importStatus === "uploading" || importStatus === "processing"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {importStatus === "uploading" && "Uploading..."}
              {importStatus === "processing" && "Processing..."}
              {(importStatus === "idle" || importStatus === "error") && (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Assessment
                </>
              )}
            </Button>
            
            {importStatus !== "success" && (
              <Link href="/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
            )}
          </div>

          {/* Information Panel */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Import Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Format:</strong> JSON files only (structured data from App A assessment system)</li>
              <li>• <strong>Required fields:</strong> respondent.id, assessment.assessmentId, assessment.completedAt</li>
              <li>• <strong>Maximum file size:</strong> 10MB</li>
              <li>• <strong>Security:</strong> Files are stored securely with integrity validation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
