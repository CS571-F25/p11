import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { searchMoviesQuery } from "@/lib/external";
import { MovieCard } from "@/components/MovieCard";
import { Searchbar } from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  const [searchQuery, setSearchQuery] = useState<string>((q as string) || "");
  const [draftQuery, setDraftQuery] = useState<string>((q as string) || "");
  const [page, setPage] = useState<number>(() => {
    const p = parseInt((router.query.page as string) || "1", 10);
    return Number.isNaN(p) ? 1 : Math.max(1, p);
  });

  // Update search query when URL query changes
  useEffect(() => {
    const urlQuery = (router.query.q as string) || "";
    setSearchQuery(urlQuery);
    setDraftQuery(urlQuery);
    const p = parseInt((router.query.page as string) || "1", 10);
    setPage(Number.isNaN(p) ? 1 : Math.max(1, p));
  }, [router.query.q, router.query.page]);

  const { data: searchResults, isLoading } = searchMoviesQuery(searchQuery, page);

  const handleSearch = () => {
    const trimmedQuery = draftQuery.trim();
    setSearchQuery(trimmedQuery);
    setPage(1);
    const params = new URLSearchParams();
    if (trimmedQuery.length > 0) {
      params.set('q', trimmedQuery);
    }
    router.push({ pathname: '/search', query: Object.fromEntries(params) }, undefined, { shallow: true });
  };


  const handlePrev = () => {
    const newPage = Math.max(1, page - 1);
    setPage(newPage);
    const params = new URLSearchParams();
    if (searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
    }
    if (newPage > 1) {
      params.set('page', String(newPage));
    }
    router.push({ pathname: '/search', query: Object.fromEntries(params) }, undefined, { shallow: true });
  };

  const handleNext = () => {
    const totalPages = searchResults?.total_pages || 1;
    const newPage = Math.min(totalPages, page + 1);
    setPage(newPage);
    const params = new URLSearchParams();
    if (searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
    }
    if (newPage > 1) {
      params.set('page', String(newPage));
    }
    router.push({ pathname: '/search', query: Object.fromEntries(params) }, undefined, { shallow: true });
  };

  return (
    <div className="min-h-screen">
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Search Movies</h1>
          
          {/* Search Bar */}
          <div className="mb-8">
            <Searchbar
              value={draftQuery}
              onChange={setDraftQuery}
              onSubmit={handleSearch}
              isLoading={isLoading}
              placeholder="Search for movies..."
            />
          </div>

          {/* Results */}
          {searchQuery.trim().length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Enter a movie title to search
              </p>
            </div>
          ) : isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <span className="block text-lg">Searching...</span>
            </div>
          ) : searchResults && searchResults.results.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Found {searchResults.total_results} result{searchResults.total_results !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {searchResults.results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Pagination */}
              {searchResults.total_pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handlePrev} 
                    disabled={page === 1 || isLoading}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {searchResults.total_pages}
                  </span>
                  <Button 
                    onClick={handleNext} 
                    disabled={page >= searchResults.total_pages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No movies found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

