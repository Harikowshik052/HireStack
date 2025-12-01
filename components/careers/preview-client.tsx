"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Search, Briefcase } from "lucide-react"
import BannerCarousel from "@/components/careers/banner-carousel"
import SectionComments from "@/components/editor/section-comments"

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

interface PreviewClientProps {
  company: Company
}

export default function PreviewClient({ company }: PreviewClientProps) {
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
      <div className="relative">
        <div className="absolute right-4 top-4 z-[60]">
          <SectionComments 
            sectionId={`header-${company.id}`}
            companySlug={company.slug}
          />
        </div>
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm" style={{ fontFamily }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company.theme?.logoUrl && (
                <img
                  src={company.theme.logoUrl}
                  alt={`${company.name} logo`}
                  className="h-10 w-auto object-contain"
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
      </div>

      {/* Hero Banner */}
      <header className="relative">
        <div className="absolute right-4 top-4 z-10">
          <SectionComments 
            sectionId={`banner-${company.id}`}
            companySlug={company.slug}
          />
        </div>
        {((company.theme?.bannerUrls as string[])?.length || 0) > 0 ? (
          <div className="relative h-96">
            <BannerCarousel
              banners={company.theme?.bannerUrls as string[]}
              autoRotate={company.theme?.autoRotate ?? true}
              rotationInterval={company.theme?.rotationInterval ?? 2000}
              className="h-96"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white px-4 z-10 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl" style={{ fontFamily }}>{company.name}</h1>
                {company.description && (
                  <p className="text-lg md:text-xl drop-shadow-lg line-clamp-2" style={{ fontFamily }}>{company.description}</p>
                )}
              </div>
            </div>
          </div>
        ) : company.theme?.bannerUrl ? (
          <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${company.theme.bannerUrl})` }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl" style={{ fontFamily }}>{company.name}</h1>
                {company.description && (
                  <p className="text-lg md:text-xl drop-shadow-lg line-clamp-2" style={{ fontFamily }}>{company.description}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-96 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <div className="text-center text-white px-4 max-w-4xl mx-auto">
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
        <section className="container mx-auto px-4 py-12 relative">
          <div className="absolute right-4 top-4">
            <SectionComments 
              sectionId={`video-${company.id}`}
              companySlug={company.slug}
            />
          </div>
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

      {/* Page Sections with Comments */}
      <main className="container mx-auto px-4 py-12">
        {company.sections.map((section) => (
          <section key={section.id} id={section.type.toLowerCase()} className="mb-12">
            {/* Section Header with Comment Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily }}>
                {section.title}
              </h2>
              <SectionComments 
                sectionId={section.id}
                companySlug={company.slug}
              />
            </div>
            
            <div 
              className="prose max-w-none"
              style={{ fontFamily }}
              dangerouslySetInnerHTML={{ __html: section.content.html }}
            />
          </section>
        ))}

        {/* Jobs Section */}
        <section id="jobs" className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily }}>Open Positions</h2>
            <SectionComments 
              sectionId={`jobs-${company.id}`}
              companySlug={company.slug}
            />
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ fontFamily }}
                />
              </div>
            </div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border rounded-md px-4 py-2"
              style={{ fontFamily }}
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="border rounded-md px-4 py-2"
              style={{ fontFamily }}
            >
              <option value="all">All Types</option>
              {uniqueJobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Job Listings */}
          <div className="grid gap-4">
            {filteredJobs.length === 0 ? (
              <p className="text-center text-gray-500 py-8" style={{ fontFamily }}>No jobs found matching your criteria.</p>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow relative">
                  <div className="absolute right-4 top-4">
                    <SectionComments 
                      sectionId={`job-${job.id}`}
                      companySlug={company.slug}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle style={{ color: primaryColor, fontFamily }}>{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground" style={{ fontFamily }}>
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location} • {job.locationType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.jobType}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent style={{ fontFamily }}>
                    <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                    <Button className="mt-4" style={{ backgroundColor: secondaryColor, fontFamily }}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-12 mt-16 relative">
        <div className="absolute right-4 top-4">
          <SectionComments 
            sectionId={`footer-${company.id}`}
            companySlug={company.slug}
          />
        </div>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {company.theme?.logoUrl && (
                  <img
                    src={company.theme.logoUrl}
                    alt={company.name}
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
          <div className="border-t pt-6 text-center text-sm text-muted-foreground mt-8" style={{ fontFamily }}>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
