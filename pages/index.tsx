import { useState } from "react";
import { useRouter } from "next/router";
import {Searchbar} from "@/components/Searchbar"
import {FeaturedMovies} from "@/components/FeaturedMovies"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length > 0) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="min-h-screen">
     <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Discover Your Next Favorite Movie
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty">
              Search through millions of movies and TV shows. Find exactly what you want to watch tonight.
            </p>
            <Searchbar 
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-8">Trending Now</h3>
          <FeaturedMovies />
          <div className="mt-8 text-center">
            <Link href="/trending">
              <Button size="lg" className="gap-2">
                View All Trending Movies
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
