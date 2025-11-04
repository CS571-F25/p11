import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { searchMoviesQuery } from "@/lib/external";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { MovieOverview } from "@/lib/types/movie";

export default function SearchPage() {
  const router = useRouter();
  const { q, language, year } = router.query;

  const [searchQuery, setSearchQuery] = useState<string>((q as string) || "");
  const [draftQuery, setDraftQuery] = useState<string>((q as string) || "");
  const [page, setPage] = useState<number>(() => {
    const p = parseInt((router.query.page as string) || "1", 10);
    return Number.isNaN(p) ? 1 : Math.max(1, p);
  });
  const [languageParam, setLanguageParam] = useState<string>((language as string) || "en-US");
  const [draftLanguage, setDraftLanguage] = useState<string>((language as string) || "en-US");
  const [yearParam, setYearParam] = useState<string>((year as string) || "");
  const [draftYear, setDraftYear] = useState<string>((year as string) || "");

  // Update search query when URL query changes
  useEffect(() => {
    const urlQuery = (router.query.q as string) || "";
    setSearchQuery(urlQuery);
    setDraftQuery(urlQuery);
    const p = parseInt((router.query.page as string) || "1", 10);
    setPage(Number.isNaN(p) ? 1 : Math.max(1, p));
    const urlLanguage = (router.query.language as string) || "en-US";
    setLanguageParam(urlLanguage);
    setDraftLanguage(urlLanguage);
    const urlYear = (router.query.year as string) || "";
    setYearParam(urlYear);
    setDraftYear(urlYear);
  }, [router.query.q, router.query.page, router.query.language, router.query.year]);

  const { data: searchResults, isLoading } = searchMoviesQuery(
    searchQuery, 
    page,
    languageParam || undefined,
    yearParam || undefined
  );
  
  const handleSearch = () => {
    const trimmedQuery = draftQuery.trim();
    setSearchQuery(trimmedQuery);
    setLanguageParam(draftLanguage);
    setYearParam(draftYear);
    setPage(1);
    const params = new URLSearchParams();
    if (trimmedQuery.length > 0) {
      params.set('q', trimmedQuery);
    }
    if (draftLanguage) {
      params.set('language', draftLanguage);
    }
    if (draftYear) {
      params.set('year', draftYear);
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
    if (languageParam) {
      params.set('language', languageParam);
    }
    if (yearParam) {
      params.set('year', yearParam);
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
    if (languageParam) {
      params.set('language', languageParam);
    }
    if (yearParam) {
      params.set('year', yearParam);
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
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search for movies..."
                    value={draftQuery}
                    onChange={(e) => setDraftQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="pl-12 h-14 text-base bg-card border-border/50 focus-visible:ring-primary"
                  />
                </div>
                <Input
                  id="language"
                  type="text"
                  value={draftLanguage}
                  onChange={(e) => setDraftLanguage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="en-US"
                  className="h-14 text-base bg-card border-border/50 focus-visible:ring-primary w-[120px]"
                />
                <Input
                  id="year"
                  type="text"
                  value={draftYear}
                  onChange={(e) => setDraftYear(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Year"
                  className="h-14 text-base bg-card border-border/50 focus-visible:ring-primary w-[100px]"
                />
                <Button 
                  size="lg" 
                  className="h-14 px-8"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
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

