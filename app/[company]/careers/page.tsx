import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CareersPageClient from "@/components/careers/careers-page-client"

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

  if (!company || !company.isPublished) {
    notFound()
  }

  return <CareersPageClient company={company} />
}
