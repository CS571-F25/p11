import Link from "next/link"
import { Film } from "lucide-react"

export function Footer() {
  return (
      <footer className="border-t border-border/50 py-12 mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" aria-label="ReelFindr logo" aria-hidden="true" />
              <span className="font-semibold">ReelFindr</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 ReelFindr. Find your perfect movie.</p>
          </div>
        </div>
      </footer>
  )
}
