import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CareersPageClient from "@/components/careers/careers-page-client"

// Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CareersPageProps {
  params: {
    company: string
  }
}

export async function generateMetadata({ params }: CareersPageProps) {
  const company = await prisma.company.findUnique({
    where: { slug: params.company },
  })

  if (!company) {
    return {
      title: "Company Not Found",
    }
  }

  return {
    title: `Careers at ${company.name}`,
    description: company.description || `Join ${company.name} - View open positions`,
  }
}

export default async function CareersPage({ params }: CareersPageProps) {
  const company = await prisma.company.findUnique({
    where: { slug: params.company },
    include: {
      theme: true,
      sections: {
        where: { isVisible: true },
        orderBy: { order: "asc" },
      },
      jobs: {
        where: { isActive: true },
        orderBy: { postedAt: "desc" },
      },
    },
  })

  // Only show if published AND has been published/republished at least once
  if (!company || !company.isPublished || !company.lastPublishedAt) {
    notFound()
  }

  // Use published snapshot if available (shows last published version, not latest saves)
  let displayData = company
  if (company.publishedSnapshot) {
    const snapshot = company.publishedSnapshot as any
    displayData = {
      ...company,
      theme: snapshot.theme || company.theme,
      sections: snapshot.sections || company.sections,
      jobs: snapshot.jobs || company.jobs,
    }
  }
  
  return <CareersPageClient company={displayData} />
}
