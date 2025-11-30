import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, companySlug, email, password } = body

    // Validate required fields
    if (!companyName || !companySlug || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if company slug already exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug: companySlug }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "This company URL is already taken. Please choose another." },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: companySlug,
          description: `Welcome to ${companyName}! We're excited to have you join our team.`
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: companyName,
          role: "ADMIN",
          companyId: company.id
        }
      })

      // Create default theme
      await tx.companyTheme.create({
        data: {
          companyId: company.id,
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          backgroundColor: "#FFFFFF",
          fontFamily: "Inter",
          fontSize: "16px"
        }
      })

      // Create default sections
      await tx.pageSection.createMany({
        data: [
          {
            companyId: company.id,
            type: "ABOUT",
            title: "About Us",
            content: { html: `<p>Welcome to ${companyName}! Add your company story here.</p>` },
            layout: "FULL_WIDTH",
            order: 1,
            isVisible: true
          },
          {
            companyId: company.id,
            type: "CULTURE",
            title: "Our Culture",
            content: { html: "<p>Describe your company culture and values here.</p>" },
            layout: "FULL_WIDTH",
            order: 2,
            isVisible: true
          },
          {
            companyId: company.id,
            type: "BENEFITS",
            title: "Benefits & Perks",
            content: { html: "<p>List your company benefits and perks here.</p>" },
            layout: "FULL_WIDTH",
            order: 3,
            isVisible: true
          }
        ]
      })

      return { company, user }
    })

    return NextResponse.json({
      success: true,
      companySlug: result.company.slug,
      message: "Account created successfully"
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    )
  }
}
