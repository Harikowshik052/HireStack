import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer group-hover:scale-105 transition-transform">
              HireStack
            </h1>
          </Link>
          <nav className="flex gap-3">
            <Link href="/signup">
              <Button>Publish Page</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Build Beautiful Careers Pages
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create branded, mobile-friendly careers pages that tell your story
            and help candidates discover open roles.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Publish Page
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Login
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            New customer? Click "Publish Page" to create your careers page. <br />
            Existing customer? Click "Login" to manage your page.
          </p>
        </section>

        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8">Features</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Custom Branding</h4>
                <p className="text-muted-foreground">
                  Set your brand colors, logo, and banner to match your company identity.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Drag & Drop Builder</h4>
                <p className="text-muted-foreground">
                  Easily add, remove, and reorder content sections with a visual editor.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Job Listings</h4>
                <p className="text-muted-foreground">
                  Showcase open positions with filters and search functionality.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Hire Stack. Built for recruiters.
        </div>
      </footer>
    </div>
  )
}
