import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET: Fetch all users for a company
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: {
        users: {
          where: { email: session.user.email }
        }
      }
    })

    if (!company || company.users.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Only admins can view all users
    if (company.users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const allUsers = await prisma.user.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST: Add new user to company
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, password, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: {
        users: {
          where: { email: session.user.email }
        }
      }
    })

    if (!company || company.users.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Only admins can add users
    if (company.users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email,
        password: hashedPassword,
        role: role || 'RECRUITER',
        companyId: company.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      user: newUser
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
