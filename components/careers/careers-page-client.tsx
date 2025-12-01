"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Search, Briefcase } from "lucide-react"
import BannerCarousel from "@/components/careers/banner-carousel"

interface Job {
  id: string
  title: string
  department: string | null
  location: string
  locationType: string
  jobType: string
  description: string
  postedAt: Date
}

interface Section {
  id: string
  type: string
  title: string
  content: any
  order: number
}

interface Theme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  logoUrl: string | null
  bannerUrl: string | null
  bannerUrls: any
  autoRotate: boolean
  rotationInterval: number
  videoUrl: string | null
  headerLinks: any
  footerText: string | null
  footerLinks: any
  fontFamily: string
  fontSize: string
}

interface Company {
  id: string
  name: string
  description: string | null
  slug: string
  theme: Theme | null
  sections: Section[]
  jobs: Job[]
}

interface CareersPageClientProps {
  company: Company
}

export default function CareersPageClient({ company }: CareersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all")

  const primaryColor = company.theme?.primaryColor || "#3B82F6"
  const secondaryColor = company.theme?.secondaryColor || "#1E40AF"
  const backgroundColor = company.theme?.backgroundColor || "#FFFFFF"
  const fontFamily = company.theme?.fontFamily || "Inter"
  const fontSize = company.theme?.fontSize || "16px"

  const filteredJobs = company.jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = locationFilter === "all" || job.locationType === locationFilter
    const matchesJobType = jobTypeFilter === "all" || job.jobType === jobTypeFilter
    return matchesSearch && matchesLocation && matchesJobType
  })

  const uniqueLocations = Array.from(new Set(company.jobs.map(job => job.locationType)))
  const uniqueJobTypes = Array.from(new Set(company.jobs.map(job => job.jobType)))

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor, 
      fontFamily, 
      fontSize,
      '--font-family': fontFamily,
      '--font-size': fontSize 
    } as React.CSSProperties}>
      <style jsx global>{`
        * {
          font-family: ${fontFamily}, sans-serif !important;
        }
        body, p, div, span, a, button, input, textarea, select, label, h1, h2, h3, h4, h5, h6 {
          font-family: ${fontFamily}, sans-serif !important;
        }
        body {
          font-size: ${fontSize} !important;
        }
      `}</style>
      {/* Top Navigation Header */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm" style={{ fontFamily }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company.theme?.logoUrl && (
                <img 
                  src={company.theme.logoUrl} 
                  alt={`${company.name} logo`}
                  className="h-10 object-contain"
                />
              )}
              <span className="text-xl font-bold" style={{ color: primaryColor, fontFamily }}>
                {company.name}
              </span>
            </div>
            <div className="flex items-center gap-4" style={{ fontFamily }}>
              {company.theme?.headerLinks && company.theme.headerLinks.length > 0 ? (
                (company.theme.headerLinks as Array<{label: string, url: string}>).map((link, index) => (
                  <a key={index} href={link.url} className="text-gray-700 hover:text-gray-900" style={{ fontFamily }}>
                    {link.label}
                  </a>
                ))
              ) : (
                <>
                  <a href="#jobs" className="text-gray-700 hover:text-gray-900" style={{ fontFamily }}>
                    Open Positions
                  </a>
                  <a href="#about" className="text-gray-700 hover:text-gray-900" style={{ fontFamily }}>
                    About Us
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <header className="relative">
        {((company.theme?.bannerUrls as string[])?.length || 0) > 0 ? (
          <div className="relative">
            <BannerCarousel
              banners={(company.theme?.bannerUrls as string[]) || []}
              autoRotate={company.theme?.autoRotate !== false}
              rotationInterval={company.theme?.rotationInterval || 2000}
              className="h-[400px]"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="container mx-auto px-4 text-center text-white">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl" style={{ fontFamily }}>{company.name}</h1>
                {company.description && (
                  <p className="text-lg md:text-xl max-w-4xl mx-auto drop-shadow-lg line-clamp-2" style={{ fontFamily }}>{company.description}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="py-20 text-white"
            style={{ 
              backgroundColor: primaryColor,
              fontFamily
            }}
          >
            <div className="container mx-auto px-4 text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl" style={{ fontFamily }}>{company.name}</h1>
              {company.description && (
                <p className="text-lg md:text-xl drop-shadow-lg line-clamp-2" style={{ fontFamily }}>{company.description}</p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Culture Video Section */}
      {company.theme?.videoUrl && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: primaryColor, fontFamily }}>
            See Our Culture in Action
          </h2>
          <div className="max-w-4xl mx-auto">
            {company.theme.videoUrl.includes('youtube.com') || company.theme.videoUrl.includes('youtu.be') ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`${company.theme.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}?autoplay=1&mute=1`}
                  title="Company Culture Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            ) : (
              <video 
                src={company.theme.videoUrl} 
                controls
                autoPlay
                muted
                loop
                className="w-full rounded-lg shadow-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {(() => {
          const groupedSections = company.sections.reduce((acc: any, section: any) => {
            const group = section.columnGroup || 0
            if (!acc[group]) acc[group] = []
            acc[group].push(section)
            return acc
          }, {})

          const sortedGroups = Object.values(groupedSections)
            .map((group: any) => group.sort((a: any, b: any) => a.columnIndex - b.columnIndex))
            .sort((a: any, b: any) => a[0].order - b[0].order)

          return sortedGroups.map((group: any, groupIdx: number) => (
            <div key={groupIdx} className="mb-16">
              <div className={`grid gap-8 ${
                group.length === 2 ? 'md:grid-cols-2' : 
                group.length === 3 ? 'md:grid-cols-3' : ''
              }`}>
                {group.map((section: any) => {
                  const layout = section.layout || 'FULL_WIDTH'
                  const content = typeof section.content === 'string' ? section.content : section.content.html || ''
                  const columns = content.split('|||').map((c: string) => c.trim())
                  
                  return (
                    <section key={section.id} className="min-w-0" style={{ fontFamily }}>
                      <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor, fontFamily }}>
                        {section.title}
                      </h2>
                      {layout === 'TWO_COLUMN' && columns.length >= 2 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {columns.slice(0, 2).map((col: string, idx: number) => (
                            <div key={idx} className="prose prose-sm max-w-none" style={{ fontFamily }}>
                              <div dangerouslySetInnerHTML={{ __html: col }} />
                            </div>
                          ))}
                        </div>
                      ) : layout === 'THREE_COLUMN' && columns.length >= 3 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {columns.slice(0, 3).map((col: string, idx: number) => (
                            <div key={idx} className="prose prose-sm max-w-none" style={{ fontFamily }}>
                              <div dangerouslySetInnerHTML={{ __html: col }} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="prose max-w-none" style={{ fontFamily }}>
                          <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            </div>
          ))
        })()}

        {/* Jobs Section */}
        <section id="jobs" className="mt-16" style={{ fontFamily }}>
          <h2 className="text-3xl font-bold mb-8" style={{ color: primaryColor, fontFamily }}>
            Open Positions
          </h2>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ fontFamily }}
              />
            </div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
              style={{ fontFamily }}
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
              style={{ fontFamily }}
            >
              <option value="all">All Job Types</option>
              {uniqueJobTypes.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground" style={{ fontFamily }}>
                  No jobs found matching your criteria.
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow" style={{ fontFamily }}>
                  <CardHeader>
                    <CardTitle className="text-xl" style={{ fontFamily }}>{job.title}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-4 mt-2" style={{ fontFamily }}>
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location} · {job.locationType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.jobType.replace('_', ' ')}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3" style={{ fontFamily }}>
                      {job.description}
                    </p>
                    <Button 
                      className="mt-4"
                      style={{ backgroundColor: secondaryColor, fontFamily }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t py-12 mt-16 bg-white" style={{ fontFamily }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {company.theme?.logoUrl && (
                  <img 
                    src={company.theme.logoUrl} 
                    alt={`${company.name} logo`}
                    className="h-8 object-contain"
                  />
                )}
                <span className="text-lg font-bold" style={{ color: primaryColor, fontFamily }}>
                  {company.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily }}>
                {company.theme?.footerText || company.description || 'Join our team and help us build the future.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3" style={{ fontFamily }}>Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {company.theme?.footerLinks && company.theme.footerLinks.length > 0 ? (
                  (company.theme.footerLinks as Array<{label: string, url: string}>).map((link, index) => (
                    <li key={index}>
                      <a href={link.url} className="hover:text-gray-900" style={{ fontFamily }}>{link.label}</a>
                    </li>
                  ))
                ) : (
                  <>
                    <li><a href="#jobs" className="hover:text-gray-900" style={{ fontFamily }}>Open Positions</a></li>
                    <li><a href="#about" className="hover:text-gray-900" style={{ fontFamily }}>About Us</a></li>
                    <li><a href="#culture" className="hover:text-gray-900" style={{ fontFamily }}>Culture</a></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3" style={{ fontFamily }}>Contact</h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily }}>
                Interested in joining our team? Check out our open positions.
              </p>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-muted-foreground" style={{ fontFamily }}>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
