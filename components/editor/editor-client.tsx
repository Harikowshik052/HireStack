"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SortableSection from "./sortable-section"
import { Eye, Save, Plus, Upload, MoreVertical, Users, Palette, FileText, Briefcase, Building2, Globe, Image, Video, Type, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BulkUploadDialog from "./bulk-upload-dialog"
import UserManagementDialog from "./user-management-dialog"
import UserAvatarMenu from "./user-avatar-menu"
import { toast } from "sonner"

interface Section {
  id: string
  type: string
  title: string
  content: any
  layout?: string
  order: number
  columnGroup: number
  columnIndex: number
  isVisible: boolean
}

interface Theme {
  id: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  logoUrl: string | null
  bannerUrl: string | null
  bannerUrls: string[] | null
  autoRotate: boolean
  rotationInterval: number
  videoUrl: string | null
  headerLinks: Array<{label: string, url: string}> | null
  footerText: string | null
  footerLinks: Array<{label: string, url: string}> | null
  fontFamily: string
  fontSize: string
}

interface Company {
  id: string
  name: string
  description: string | null
  slug: string
  isPublished: boolean
  theme: Theme | null
  sections: Section[]
  jobs: any[]
  currentUserRole?: 'ADMIN' | 'RECRUITER'
  currentUserEmail?: string
  currentUserName?: string | null
}

interface EditorClientProps {
  company: Company
}

export default function EditorClient({ company: initialCompany }: EditorClientProps) {
  const router = useRouter()
  const [company, setCompany] = useState(initialCompany)
  const [sections, setSections] = useState(company.sections)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("theme")
  const [showJobForm, setShowJobForm] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    locationType: 'REMOTE',
    jobType: 'FULL_TIME',
    description: '',
    requirements: '',
    salary: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const groupedSections = sections.reduce((acc, section) => {
    const group = section.columnGroup
    if (!acc[group]) acc[group] = []
    acc[group].push(section)
    return acc
  }, {} as Record<number, Section[]>)

  const sortedGroups = Object.values(groupedSections)
    .map(group => group.sort((a, b) => a.columnIndex - b.columnIndex))
    .sort((a, b) => a[0].order - b[0].order)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update order based on new positions
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }))
      })
    }
  }

  const handleAddSectionGroup = () => {
    const maxGroup = Math.max(...sections.map(s => s.columnGroup), -1)
    const newGroup = maxGroup + 1
    const baseOrder = sections.length
    
    const newSections: Section[] = [
      {
        id: `temp-${Date.now()}-1`,
        type: "CUSTOM",
        title: "Section 1",
        content: { html: "<p>First section content...</p>" },
        layout: "FULL_WIDTH",
        order: baseOrder,
        columnGroup: newGroup,
        columnIndex: 0,
        isVisible: true,
      },
      {
        id: `temp-${Date.now()}-2`,
        type: "CUSTOM",
        title: "Section 2",
        content: { html: "<p>Second section content...</p>" },
        layout: "FULL_WIDTH",
        order: baseOrder + 1,
        columnGroup: newGroup,
        columnIndex: 1,
        isVisible: true,
      },
    ]
    setSections([...sections, ...newSections])
  }

  const handleAddToGroup = (groupId: number) => {
    const groupSections = sections.filter(s => s.columnGroup === groupId)
    const maxIndex = Math.max(...groupSections.map(s => s.columnIndex))
    const baseOrder = Math.max(...groupSections.map(s => s.order))
    
    const newSection: Section = {
      id: `temp-${Date.now()}`,
      type: "CUSTOM",
      title: "New Section",
      content: { html: "<p>Add your content here...</p>" },
      layout: "FULL_WIDTH",
      order: baseOrder + 1,
      columnGroup: groupId,
      columnIndex: maxIndex + 1,
      isVisible: true,
    }
    setSections([...sections, newSection])
  }

  const handleUngroupSections = (groupId: number) => {
    setSections(sections.map(s => {
      if (s.columnGroup === groupId) {
        return { ...s, columnGroup: Date.now() + s.columnIndex, columnIndex: 0 }
      }
      return s
    }))
  }

  const handleAddJob = () => {
    if (!newJob.title || !newJob.department || !newJob.location || !newJob.description) {
      toast.error('Missing Required Fields', {
        description: 'Please fill in Title, Department, Location, and Description'
      })
      return
    }

    const job = {
      id: `temp-${Date.now()}`,
      ...newJob,
      isActive: true,
    }

    setCompany({
      ...company,
      jobs: [...company.jobs, job],
    })

    // Reset form
    setNewJob({
      title: '',
      department: '',
      location: '',
      locationType: 'REMOTE',
      jobType: 'FULL_TIME',
      description: '',
      requirements: '',
      salary: '',
    })
    setShowJobForm(false)
  }

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job opening?')) {
      setCompany({
        ...company,
        jobs: company.jobs.filter(j => j.id !== jobId),
      })
      toast.success('Job deleted successfully')
    }
  }

  const handleThemeChange = (field: string, value: any) => {
    setCompany({
      ...company,
      theme: {
        ...company.theme!,
        [field]: value,
      },
    })
  }

  const handleCompanyChange = (field: string, value: string) => {
    setCompany({
      ...company,
      [field]: value,
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size limits
    const maxSizeInMB = field === 'videoUrl' ? 50 : 5
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    
    if (file.size > maxSizeInBytes) {
      toast.error('File Too Large', {
        description: `Maximum size is ${maxSizeInMB}MB. For videos, use YouTube or Vimeo links for best performance.`
      })
      e.target.value = ''
      return
    }

    // Show loading indicator for larger files
    if (file.size > 1024 * 1024) {
      toast.loading('Uploading file...', { id: 'file-upload' })
    }

    // Convert file to base64 data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      handleThemeChange(field, dataUrl)
      toast.success('File uploaded successfully!', { id: 'file-upload' })
    }
    reader.onerror = () => {
      toast.error('Upload Failed', {
        description: 'Please try again or use a URL instead.',
        id: 'file-upload'
      })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleAddSection = () => {
    const maxGroup = Math.max(...sections.map(s => s.columnGroup), -1)
    const newSection: Section = {
      id: `temp-${Date.now()}`,
      type: "CUSTOM",
      title: "New Section",
      content: { html: "<p>Add your content here...</p>" },
      layout: "FULL_WIDTH",
      order: sections.length,
      columnGroup: maxGroup + 1,
      columnIndex: 0,
      isVisible: true,
    }
    setSections([...sections, newSection])
  }

  const handleUpdateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/companies/${company.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: company.name,
            description: company.description,
            isPublished: company.isPublished,
          },
          theme: company.theme,
          sections,
          jobs: company.jobs,
        }),
      })

      if (response.ok) {
        toast.success('Changes saved successfully! 🎉')
        router.refresh()
      } else {
        toast.error('Failed to save changes', {
          description: 'Please try again or contact support if the issue persists.'
        })
      }
    } catch (error) {
      toast.error('Error saving changes', {
        description: 'Please check your connection and try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    const newPublishState = !company.isPublished
    setCompany({ ...company, isPublished: newPublishState })
    
    // Auto-save when publishing/unpublishing
    setIsSaving(true)
    try {
      const response = await fetch(`/api/companies/${company.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: company.name,
            description: company.description,
            isPublished: newPublishState,
          },
          theme: company.theme,
          sections,
          jobs: company.jobs,
        }),
      })

      if (response.ok) {
        if (newPublishState) {
          toast.success('Page Published! 🎉', {
            description: `Your careers page is now live at: ${window.location.origin}/${company.slug}/careers`,
            duration: 5000
          })
        } else {
          toast.info('Page Unpublished', {
            description: 'Your careers page is now hidden from the public.'
          })
        }
        router.refresh()
      } else {
        toast.error('Failed to update publish status')
        setCompany({ ...company, isPublished: !newPublishState })
      }
    } catch (error) {
      toast.error('Error updating publish status')
      setCompany({ ...company, isPublished: !newPublishState })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
            {/* Left: Company Info */}
            <div className="min-w-0 flex-shrink">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                ID: {company.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                /{company.slug}/careers
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2 items-center flex-shrink-0">
              {/* Desktop Actions */}
              <div className="hidden md:flex gap-2 items-center">
                {company.currentUserRole === 'ADMIN' && (
                  <UserManagementDialog 
                    companySlug={company.slug} 
                    currentUserRole={company.currentUserRole || 'RECRUITER'}
                  />
                )}
                <Link href={`/${company.slug}/preview`}>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </Link>
                <Button 
                  onClick={handlePublish} 
                  variant={company.isPublished ? "outline" : "default"} 
                  size="sm"
                  className={company.isPublished ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-green-600"}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {company.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>

              {/* Mobile: Actions Dropdown */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {company.currentUserRole === 'ADMIN' && (
                      <>
                        <UserManagementDialog 
                          companySlug={company.slug} 
                          currentUserRole={company.currentUserRole || 'RECRUITER'}
                          trigger={
                            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                              <Users className="mr-2 h-4 w-4" />
                              Manage Access
                            </button>
                          }
                        />
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={`/${company.slug}/preview`} className="flex items-center cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePublish}>
                      {company.isPublished ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Avatar - Always Visible */}
              <UserAvatarMenu 
                user={{
                  name: company.currentUserName || null,
                  email: company.currentUserEmail || '',
                  role: company.currentUserRole || 'RECRUITER'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4 mb-6">
            <TabsList className="inline-flex w-auto min-w-full sm:w-auto h-11">
              <TabsTrigger value="theme" className="text-xs sm:text-sm whitespace-nowrap gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Theme & Branding</span>
                <span className="sm:hidden">Theme</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="text-xs sm:text-sm whitespace-nowrap gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Page Sections</span>
                <span className="sm:hidden">Sections</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs sm:text-sm whitespace-nowrap gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Job Roles</span>
                <span className="sm:hidden">Jobs</span>
              </TabsTrigger>
              {company.currentUserRole === 'ADMIN' && (
                <TabsTrigger value="info" className="text-xs sm:text-sm whitespace-nowrap gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Company Info</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Theme Tab */}
          <TabsContent value="theme">
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Colors & Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={company.theme?.primaryColor || "#3B82F6"}
                        onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={company.theme?.primaryColor || "#3B82F6"}
                        onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color (Buttons & Accents)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={company.theme?.secondaryColor || "#1E40AF"}
                        onChange={(e) => handleThemeChange("secondaryColor", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={company.theme?.secondaryColor || "#1E40AF"}
                        onChange={(e) => handleThemeChange("secondaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Page Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={company.theme?.backgroundColor || "#FFFFFF"}
                      onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={company.theme?.backgroundColor || "#FFFFFF"}
                      onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Brand Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {company.currentUserRole === 'ADMIN' && (
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Logo
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="logoUrl"
                        placeholder="Paste image URL"
                        value={company.theme?.logoUrl || ""}
                        onChange={(e) => handleThemeChange("logoUrl", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('logo-file-input')?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        id="logo-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add an image URL or upload your company logo (Admin only)
                    </p>
                    {company.theme?.logoUrl && (
                      <img src={company.theme.logoUrl} alt="Logo preview" className="mt-2 h-16 object-contain border rounded p-2" />
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Banner Images (Carousel)
                  </Label>
                  
                  {/* Banner List */}
                  <div className="space-y-2">
                    {(Array.isArray(company.theme?.bannerUrls) ? company.theme.bannerUrls : []).map((url, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <img src={url} alt={`Banner ${index + 1}`} className="h-16 w-24 object-cover rounded border flex-shrink-0" />
                        <Input
                          value={url}
                          onChange={(e) => {
                            const currentBanners = Array.isArray(company.theme?.bannerUrls) ? company.theme.bannerUrls : []
                            const newBanners = [...currentBanners]
                            newBanners[index] = e.target.value
                            handleThemeChange("bannerUrls", newBanners)
                          }}
                          placeholder="Banner URL"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const currentBanners = Array.isArray(company.theme?.bannerUrls) ? company.theme.bannerUrls : []
                            const newBanners = currentBanners.filter((_, i) => i !== index)
                            handleThemeChange("bannerUrls", newBanners)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Banner */}
                  <div className="flex gap-2">
                    <Input
                      id="newBannerUrl"
                      placeholder="Paste image URL and click Add"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newBannerUrl') as HTMLInputElement
                        if (input.value) {
                          const currentBanners = Array.isArray(company.theme?.bannerUrls) ? company.theme.bannerUrls : []
                          const newBanners = [...currentBanners, input.value]
                          handleThemeChange("bannerUrls", newBanners)
                          input.value = ''
                        }
                      }}
                    >
                      Add Banner
                    </Button>
                    <Button
                      type="button"
                      onClick={() => document.getElementById('banner-file-input')?.click()}
                    >
                      Upload File
                    </Button>
                    <input
                      id="banner-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('File Too Large', {
                            description: 'Maximum size is 5MB for banner images.'
                          })
                          e.target.value = ''
                          return
                        }

                        toast.loading('Uploading banner...', { id: 'banner-upload' })

                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const dataUrl = reader.result as string
                          const currentBanners = Array.isArray(company.theme?.bannerUrls) ? company.theme.bannerUrls : []
                          const newBanners = [...currentBanners, dataUrl]
                          handleThemeChange("bannerUrls", newBanners)
                          e.target.value = ''
                          toast.success('Banner uploaded successfully!', { id: 'banner-upload' })
                        }
                        reader.onerror = () => {
                          toast.error('Upload Failed', {
                            description: 'Please try again.',
                            id: 'banner-upload'
                          })
                          e.target.value = ''
                        }
                        reader.readAsDataURL(file)
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Rotation Settings */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoRotate" className="text-sm font-medium">Auto-Rotate Banners</Label>
                      <input
                        id="autoRotate"
                        type="checkbox"
                        checked={company.theme?.autoRotate !== false}
                        onChange={(e) => handleThemeChange("autoRotate", e.target.checked)}
                        className="h-4 w-4"
                      />
                    </div>
                    {(company.theme?.autoRotate !== false) && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rotationInterval" className="text-sm font-medium">
                            Rotation Speed
                          </Label>
                          <span className="text-sm text-muted-foreground font-medium">
                            {((company.theme?.rotationInterval || 2000) / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <input
                          id="rotationInterval"
                          type="range"
                          min="1000"
                          max="10000"
                          step="500"
                          value={company.theme?.rotationInterval || 2000}
                          onChange={(e) => handleThemeChange("rotationInterval", parseInt(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Adjust how fast banners rotate (1-10 seconds)</p>
                      </div>
                    )}
                    {(company.theme?.autoRotate === false) && (
                      <p className="text-xs text-muted-foreground">Manual mode: Use arrow buttons to navigate banners</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Add multiple banner images to create a carousel. Banners will auto-rotate or users can navigate manually.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Culture Video
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="videoUrl"
                      placeholder="Paste YouTube or video URL (recommended)"
                      value={company.theme?.videoUrl || ""}
                      onChange={(e) => handleThemeChange("videoUrl", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('video-file-input')?.click()}
                    >
                      Choose File
                    </Button>
                    <input
                      id="video-file-input"
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={(e) => handleFileUpload(e, 'videoUrl')}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ <strong>Recommended:</strong> Use YouTube, Vimeo, or external video URLs for best performance. File uploads limited to 50MB and may be slow.
                  </p>
                  {company.theme?.videoUrl && (
                    <div className="mt-2 border rounded">
                      {company.theme.videoUrl.includes('youtube.com') || company.theme.videoUrl.includes('youtu.be') || company.theme.videoUrl.includes('vimeo.com') ? (
                        <div className="aspect-video bg-muted flex items-center justify-center rounded">
                          <p className="text-sm text-muted-foreground">Video preview available on Preview page</p>
                        </div>
                      ) : (
                        <video 
                          src={company.theme.videoUrl} 
                          controls 
                          className="w-full max-h-64 rounded-lg"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}
                </div>

                <Card className="mt-6 bg-slate-50/50 border-slate-200">
                  <CardHeader className="border-b bg-white/50">
                    <CardTitle className="text-lg">Header & Footer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label>Header Navigation Links</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add navigation links to appear in the header (e.g., About Us, Contact)
                      </p>
                      {(company.theme?.headerLinks || []).map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Label (e.g., About Us)"
                            value={link.label}
                            onChange={(e) => {
                              const links = [...(company.theme?.headerLinks || [])]
                              links[index].label = e.target.value
                              handleThemeChange('headerLinks', links)
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="URL (e.g., #about)"
                            value={link.url}
                            onChange={(e) => {
                              const links = [...(company.theme?.headerLinks || [])]
                              links[index].url = e.target.value
                              handleThemeChange('headerLinks', links)
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const links = (company.theme?.headerLinks || []).filter((_, i) => i !== index)
                              handleThemeChange('headerLinks', links)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const links = [...(company.theme?.headerLinks || []), { label: '', url: '' }]
                          handleThemeChange('headerLinks', links)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Header Link
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footerText">Footer Description</Label>
                      <textarea
                        id="footerText"
                        placeholder="Add a description or tagline for the footer..."
                        value={company.theme?.footerText || ''}
                        onChange={(e) => handleThemeChange('footerText', e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Footer Links</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add links to appear in the footer (e.g., Privacy Policy, Terms)
                      </p>
                      {(company.theme?.footerLinks || []).map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Label (e.g., Privacy Policy)"
                            value={link.label}
                            onChange={(e) => {
                              const links = [...(company.theme?.footerLinks || [])]
                              links[index].label = e.target.value
                              handleThemeChange('footerLinks', links)
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="URL (e.g., /privacy)"
                            value={link.url}
                            onChange={(e) => {
                              const links = [...(company.theme?.footerLinks || [])]
                              links[index].url = e.target.value
                              handleThemeChange('footerLinks', links)
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const links = (company.theme?.footerLinks || []).filter((_, i) => i !== index)
                              handleThemeChange('footerLinks', links)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const links = [...(company.theme?.footerLinks || []), { label: '', url: '' }]
                          handleThemeChange('footerLinks', links)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Footer Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Typography
                </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <select
                        id="fontFamily"
                        value={company.theme?.fontFamily || 'Inter'}
                        onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Inter">Inter (Default)</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Impact">Impact</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Choose the font family for your careers page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Base Font Size</Label>
                      <select
                        id="fontSize"
                        value={company.theme?.fontSize || '16px'}
                        onChange={(e) => handleThemeChange('fontSize', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="12px">12px (Extra Small)</option>
                        <option value="14px">14px (Small)</option>
                        <option value="16px">16px (Default)</option>
                        <option value="18px">18px (Large)</option>
                        <option value="20px">20px (Extra Large)</option>
                        <option value="22px">22px (XXL)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Set the base font size for body text
                      </p>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Page Sections
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Drag to reorder, group sections side-by-side</p>
                  </div>
                  <Button onClick={handleAddSection} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="space-y-6">
                    {sortedGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            {group.length > 1 ? `Side-by-Side Group (${group.length} sections)` : 'Single Section'}
                          </span>
                          {group.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUngroupSections(group[0].columnGroup)}
                            >
                              Ungroup
                            </Button>
                          )}
                        </div>
                        <SortableContext
                          items={group.map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className={`grid gap-4 ${group.length === 2 ? 'md:grid-cols-2' : group.length === 3 ? 'md:grid-cols-3' : ''}`}>
                            {group.map((section) => (
                              <div key={section.id} className="min-w-0">
                                <SortableSection
                                  section={section}
                                  onUpdate={handleUpdateSection}
                                  onDelete={handleDeleteSection}
                                />
                              </div>
                            ))}
                          </div>
                        </SortableContext>
                        {group.length < 3 && group.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToGroup(group[0].columnGroup)}
                            className="mt-3 w-full"
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            Add Section to This Group
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Roles Tab */}
          <TabsContent value="jobs">
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Job Openings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Manage your job postings - add individual roles or bulk upload via CSV</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => setShowJobForm(!showJobForm)} 
                      size="sm"
                      variant={showJobForm ? "outline" : "default"}
                      className={!showJobForm ? "bg-primary hover:bg-primary/90" : ""}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {showJobForm ? 'Cancel' : 'Add Job Role'}
                    </Button>
                    <BulkUploadDialog 
                      companySlug={company.slug}
                      onUploadComplete={() => {
                        router.refresh()
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {showJobForm && (
                  <Card className="mb-6 bg-gradient-to-br from-blue-50 to-slate-50 border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Job Role</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input
                            id="jobTitle"
                            placeholder="e.g., Senior Full Stack Developer"
                            value={newJob.title}
                            onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobDepartment">Department</Label>
                          <Input
                            id="jobDepartment"
                            placeholder="e.g., Engineering"
                            value={newJob.department}
                            onChange={(e) => setNewJob({...newJob, department: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobLocation">Location</Label>
                          <Input
                            id="jobLocation"
                            placeholder="e.g., Berlin, Germany"
                            value={newJob.location}
                            onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobLocationType">Work Policy</Label>
                          <select
                            id="jobLocationType"
                            value={newJob.locationType}
                            onChange={(e) => setNewJob({...newJob, locationType: e.target.value})}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ONSITE">On-site</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobType">Employment Type</Label>
                          <select
                            id="jobType"
                            value={newJob.jobType}
                            onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="FULL_TIME">Full time</option>
                            <option value="PART_TIME">Part time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERNSHIP">Internship</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobSalary">Salary Range</Label>
                          <Input
                            id="jobSalary"
                            placeholder="e.g., USD 80K–120K / year"
                            value={newJob.salary || ''}
                            onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobDescription">Job Description</Label>
                        <textarea
                          id="jobDescription"
                          placeholder="Describe the role, responsibilities, and requirements..."
                          value={newJob.description}
                          onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobRequirements">Requirements</Label>
                        <textarea
                          id="jobRequirements"
                          placeholder="List the key requirements and qualifications..."
                          value={newJob.requirements || ''}
                          onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <Button onClick={handleAddJob} className="w-full">
                        Add Job Role
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold">Current Job Openings ({company.jobs.length})</h3>
                  {company.jobs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No job openings yet. Click "Add Job Role" to create one.</p>
                  ) : (
                    <div className="space-y-3">
                      {company.jobs.map((job) => (
                        <Card key={job.id} className="bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{job.title}</h4>
                                <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                                  <span>📍 {job.location}</span>
                                  <span>•</span>
                                  <span>💼 {job.department}</span>
                                  <span>•</span>
                                  <span>🏢 {job.locationType.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>⏰ {job.jobType.replace('_', ' ')}</span>
                                  {job.salary && (
                                    <>
                                      <span>•</span>
                                      <span>💰 {job.salary}</span>
                                    </>
                                  )}
                                </div>
                                <p className="mt-2 text-sm line-clamp-2">{job.description}</p>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                className="ml-4"
                              >
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Info Tab - Admin Only */}
          {company.currentUserRole === 'ADMIN' && (
            <TabsContent value="info">
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Basic company details displayed on your careers page</p>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={company.name}
                      onChange={(e) => handleCompanyChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      value={company.description || ""}
                      onChange={(e) => handleCompanyChange("description", e.target.value)}
                      placeholder="Tell candidates about your company..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
