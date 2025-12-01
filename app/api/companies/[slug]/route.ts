import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: {
        theme: true,
        sections: {
          orderBy: { order: "asc" },
        },
        jobs: {
          where: { isActive: true },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to this company
    if (session.user.companySlug !== params.slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { company: companyData, theme, sections } = body

    // Find the company
    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Update company (only if company data is provided)
    if (companyData) {
      const updateData: any = {}
      if (companyData.name !== undefined) updateData.name = companyData.name
      if (companyData.description !== undefined) updateData.description = companyData.description
      if (companyData.isPublished !== undefined) updateData.isPublished = companyData.isPublished
      if (companyData.lastPublishedAt !== undefined) updateData.lastPublishedAt = new Date(companyData.lastPublishedAt)
      if (companyData.lastSavedAt !== undefined) updateData.lastSavedAt = new Date(companyData.lastSavedAt)
      if (companyData.publishedSnapshot !== undefined) updateData.publishedSnapshot = companyData.publishedSnapshot
      
      if (Object.keys(updateData).length > 0) {
        await prisma.company.update({
          where: { id: company.id },
          data: updateData,
        })
      }
    }

    // Update or create theme
    if (theme) {
      await prisma.companyTheme.upsert({
        where: { companyId: company.id },
        update: {
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          backgroundColor: theme.backgroundColor || "#FFFFFF",
          logoUrl: theme.logoUrl,
          bannerUrl: theme.bannerUrl,
          bannerUrls: theme.bannerUrls || null,
          autoRotate: theme.autoRotate !== false,
          rotationInterval: theme.rotationInterval || 2000,
          videoUrl: theme.videoUrl,
          headerLinks: theme.headerLinks || null,
          footerText: theme.footerText || null,
          footerLinks: theme.footerLinks || null,
          fontFamily: theme.fontFamily || "Inter",
          fontSize: theme.fontSize || "16px",
        },
        create: {
          companyId: company.id,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          backgroundColor: theme.backgroundColor || "#FFFFFF",
          logoUrl: theme.logoUrl,
          bannerUrl: theme.bannerUrl,
          bannerUrls: theme.bannerUrls || null,
          autoRotate: theme.autoRotate !== false,
          rotationInterval: theme.rotationInterval || 2000,
          videoUrl: theme.videoUrl,
          headerLinks: theme.headerLinks || null,
          footerText: theme.footerText || null,
          footerLinks: theme.footerLinks || null,
          fontFamily: theme.fontFamily || "Inter",
          fontSize: theme.fontSize || "16px",
        },
      })
    }

    // Update sections
    if (sections) {
      // Delete sections that are not in the new list
      const sectionIds = sections.filter((s: any) => !s.id.startsWith('temp-')).map((s: any) => s.id)
      await prisma.pageSection.deleteMany({
        where: {
          companyId: company.id,
          id: { notIn: sectionIds },
        },
      })

      // Update or create sections
      for (const section of sections) {
        if (section.id.startsWith('temp-')) {
          // Create new section
          await prisma.pageSection.create({
            data: {
              companyId: company.id,
              type: section.type,
              title: section.title,
              content: section.content,
              layout: section.layout || 'FULL_WIDTH',
              order: section.order,
              columnGroup: section.columnGroup || 0,
              columnIndex: section.columnIndex || 0,
              isVisible: section.isVisible,
            },
          })
        } else {
          // Update existing section
          await prisma.pageSection.update({
            where: { id: section.id },
            data: {
              type: section.type,
              title: section.title,
              content: section.content,
              layout: section.layout || 'FULL_WIDTH',
              order: section.order,
              columnGroup: section.columnGroup || 0,
              columnIndex: section.columnIndex || 0,
              isVisible: section.isVisible,
            },
          })
        }
      }
    }

    // Update jobs
    const { jobs } = body
    if (jobs) {
      // Delete jobs that are not in the new list
      const jobIds = jobs.filter((j: any) => !j.id.startsWith('temp-')).map((j: any) => j.id)
      await prisma.job.deleteMany({
        where: {
          companyId: company.id,
          id: { notIn: jobIds },
        },
      })

      // Update or create jobs
      for (const job of jobs) {
        if (job.id.startsWith('temp-')) {
          // Create new job
          await prisma.job.create({
            data: {
              companyId: company.id,
              title: job.title,
              department: job.department,
              location: job.location,
              locationType: job.locationType,
              jobType: job.jobType,
              description: job.description,
              requirements: job.requirements || '',
              salary: job.salary || '',
              isActive: job.isActive !== false,
            },
          })
        } else {
          // Update existing job
          await prisma.job.update({
            where: { id: job.id },
            data: {
              title: job.title,
              department: job.department,
              location: job.location,
              locationType: job.locationType,
              jobType: job.jobType,
              description: job.description,
              requirements: job.requirements || '',
              salary: job.salary || '',
              isActive: job.isActive !== false,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}
