import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Papa from "papaparse"

interface CSVRow {
  title: string
  work_policy: string
  location: string
  department: string
  employment_type: string
  experience_level: string
  job_type: string
  salary_range: string
  job_slug?: string
  posted_days_ago?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const companySlug = formData.get("companySlug") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get company and verify user has access
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      include: {
        users: {
          where: { email: session.user.email }
        }
      }
    })

    if (!company || company.users.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Read CSV file
    const text = await file.text()
    const parseResult = Papa.parse<CSVRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV parsing error", details: parseResult.errors },
        { status: 400 }
      )
    }

    const rows = parseResult.data

    // Validate required fields
    const requiredFields = ['title', 'work_policy', 'location', 'department']
    const invalidRows: number[] = []

    rows.forEach((row, index) => {
      const missingFields = requiredFields.filter(field => !row[field as keyof CSVRow])
      if (missingFields.length > 0) {
        invalidRows.push(index + 2) // +2 for header and 0-index
      }
    })

    if (invalidRows.length > 0) {
      return NextResponse.json(
        { error: `Invalid data in rows: ${invalidRows.join(', ')}. Missing required fields.` },
        { status: 400 }
      )
    }

    // Map work_policy to locationType
    const mapLocationType = (workPolicy: string): 'REMOTE' | 'HYBRID' | 'ONSITE' => {
      const policy = workPolicy.toLowerCase()
      if (policy.includes('remote')) return 'REMOTE'
      if (policy.includes('hybrid')) return 'HYBRID'
      return 'ONSITE'
    }

    // Map employment_type and job_type to jobType
    const mapJobType = (employmentType: string, jobType: string): 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' => {
      const type = (employmentType || jobType || '').toLowerCase()
      if (type.includes('part')) return 'PART_TIME'
      if (type.includes('contract')) return 'CONTRACT'
      if (type.includes('intern')) return 'INTERNSHIP'
      return 'FULL_TIME'
    }

    // Create jobs
    const jobs = rows.map((row) => ({
      companyId: company.id,
      title: row.title,
      department: row.department || 'General',
      location: row.location,
      locationType: mapLocationType(row.work_policy),
      jobType: mapJobType(row.employment_type, row.job_type),
      description: `We are hiring a ${row.title} to join our ${row.department} team in ${row.location}. This is a ${row.work_policy} position.`,
      requirements: `Experience Level: ${row.experience_level || 'Not specified'}. ${row.employment_type || 'Full time'} position.`,
      salary: row.salary_range || null,
      isActive: true,
    }))

    // Bulk create jobs
    const result = await prisma.job.createMany({
      data: jobs,
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully created ${result.count} jobs`
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload jobs" },
      { status: 500 }
    )
  }
}
