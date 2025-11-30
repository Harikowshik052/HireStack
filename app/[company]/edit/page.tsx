import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EditorClient from "@/components/editor/editor-client"

interface EditPageProps {
  params: {
    company: string
  }
}

export default async function EditPage({ params }: EditPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Get current user to check role
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true, companyId: true, email: true, name: true }
  })

  const company = await prisma.company.findUnique({
    where: { slug: params.company },
    include: {
      theme: true,
      sections: {
        orderBy: { order: "asc" },
      },
      jobs: {
        where: { isActive: true },
        orderBy: { postedAt: "desc" },
      },
    },
  })

  if (!company) {
    redirect("/")
  }

  // Check if user has access to this company
  if (!currentUser || currentUser.companyId !== company.id) {
    redirect("/")
  }

  return <EditorClient company={{
    ...company,
    currentUserRole: currentUser.role,
    currentUserEmail: currentUser.email,
    currentUserName: currentUser.name
  }} />
}
