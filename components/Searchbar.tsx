import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Searchbar() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for movies, TV shows, actors..."
            className="pl-12 h-14 text-base bg-card border-border/50 focus-visible:ring-primary"
          />
        </div>
        <Button size="lg" className="h-14 px-8">
          Search
        </Button>
      </div>
    </div>
  )
}
