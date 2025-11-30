import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH: Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['ADMIN', 'RECRUITER'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
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

    // Only admins can update roles
    if (company.users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE: Remove user from company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; userId: string } }
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

    // Only admins can delete users
    if (company.users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Prevent deleting yourself
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.userId }
    })

    if (userToDelete?.email === session.user.email) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.userId }
    })

    return NextResponse.json({
      success: true,
      message: "User removed successfully"
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
