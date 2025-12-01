import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PreviewClient from "@/components/careers/preview-client"

interface PreviewPageProps {
  params: {
    company: string
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user has access to this company
  if (session.user.companySlug !== params.company) {
    redirect("/")
  }

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

  if (!company) {
    redirect("/")
  }

  return (
    <div>
      <div className="bg-yellow-100 border-b border-yellow-200 py-2 px-4 text-center text-sm">
        <strong>Preview Mode</strong> - This is how your careers page will look to candidates. Comment buttons are visible for team collaboration.
      </div>
      <PreviewClient company={company} />
    </div>
  )
}
