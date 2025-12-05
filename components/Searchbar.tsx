import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchbarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function Searchbar({ 
  value = "", 
  onChange, 
  onSubmit, 
  isLoading = false,
  placeholder = "Search for movies, TV shows, actors..."
}: SearchbarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-label="Search icon" aria-hidden="true" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-12 h-14 text-base bg-card border-border/50 focus-visible:ring-primary"
          />
        </div>
        <Button 
          size="lg" 
          className="h-14 px-8"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-label="Searching" />
              Searching
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </div>
  )
}
