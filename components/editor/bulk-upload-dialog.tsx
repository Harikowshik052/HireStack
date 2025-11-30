"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Download, FileSpreadsheet } from "lucide-react"

interface BulkUploadDialogProps {
  companySlug: string
  onUploadComplete: () => void
}

export default function BulkUploadDialog({ companySlug, onUploadComplete }: BulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDownloadTemplate = () => {
    const csvContent = `title,work_policy,location,department,employment_type,experience_level,job_type,salary_range,job_slug,posted_days_ago
Full Stack Engineer,Remote,"Berlin, Germany",Engineering,Full time,Senior,Permanent,"USD 80K-120K / year",full-stack-engineer,5
Frontend Developer,Hybrid,"Boston, USA",Engineering,Full time,Mid-level,Permanent,"USD 70K-100K / year",frontend-developer,10`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Job_Data_Template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('companySlug', companySlug)

      const response = await fetch('/api/jobs/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess(`Successfully uploaded ${data.count} jobs!`)
      setTimeout(() => {
        setIsOpen(false)
        onUploadComplete()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Job Roles</DialogTitle>
          <DialogDescription>
            Upload multiple job roles at once using a CSV file
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Download Template */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Step 1: Download Template</h4>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <p className="text-xs text-muted-foreground">
              Download the template with correct column format
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Upload File */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Step 2: Upload Your CSV</h4>
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="csv-upload" className="flex-1">
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  disabled={isUploading}
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'I Already Have CSV'}
                </Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your filled CSV file with job data
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          {/* CSV Format Info */}
          <div className="bg-muted p-3 rounded-md text-xs space-y-1">
            <p className="font-medium">Required columns:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>title, work_policy (Remote/Hybrid/On-site)</li>
              <li>location, department, employment_type</li>
              <li>experience_level, job_type, salary_range</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
