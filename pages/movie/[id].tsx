import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { getMovieDetailsQuery, getMovieWatchProvidersQuery, getMovieRecommendationsQuery } from "@/lib/external"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, Star, Calendar, Users, Play, ArrowRight } from "lucide-react"
import { genresList } from "@/lib/utils"
import { CommentSection } from "@/components/CommentSection"
import { MovieCard } from "@/components/MovieCard"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

export default function MovieDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const [showRecommendedMovies, setShowRecommendedMovies] = useState(false)

  const { data: movie, isLoading } = getMovieDetailsQuery(id as string)
  const { data: watchProviders } = getMovieWatchProvidersQuery(id as string)
  const { data: recommendedMovies } = getMovieRecommendationsQuery(id as string)

  const upsertMovie = useMutation(api.movies.upsertByExternalId);
  const [convexMovieId, setConvexMovieId] = useState<string | null>(null);

  useEffect(() => {
    if (!movie) return;

    upsertMovie({
      external_id: movie.id.toString(),
      rating: movie.vote_average,
      overview: movie.overview || "",
      genre: movie.genre_ids ? movie.genre_ids.join(",") : "",
      release_year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : "",
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : "",
    }).then((id) => setConvexMovieId(id as string));
  }, [movie, upsertMovie]);

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" aria-label="Loading" />
      </div>
    )
  }

  const getGenreNames = (genreIds: number[]) => {
    return genreIds.map((id) => genresList.find((g) => g.id === id)?.name).filter(Boolean)
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null

  return (
    <>
      <Head>
        <title>{movie.title} - ReelFindr</title>
      </Head>
      <div className="container mx-auto">
      {/* Back Button */}
      <Button variant="outline" className="mb-8 gap-2 bg-transparent" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" aria-label="Back" aria-hidden="true" />
        Back
      </Button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Poster Section */}
        <aside className="col-span-12 md:col-span-3">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              alt={movie.title + " poster"}
              className="w-full rounded-lg shadow-lg"
              aria-hidden="true"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">No poster available</span>
            </div>
          )}

          {/* Quick Info Card */}
          <Card className="mt-6 p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-label="Rating" aria-hidden="true" />
                <span className="font-semibold">{movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Based on {movie.vote_count?.toLocaleString()} votes
              </span>
            </div>

            {releaseYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-label="Release year" aria-hidden="true" />
                <span className="text-sm">{releaseYear}</span>
              </div>
            )}

            {movie.runtime && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" aria-label="Runtime" aria-hidden="true" />
                <span className="text-sm">{movie.runtime} minutes</span>
              </div>
            )}

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">Genres</div>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: { id: number; name: string }) => (
                    <Badge key={genre.id} variant="outline" className="bg-transparent text-white border-primary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Watch Providers */}
          {watchProviders && watchProviders.results && (
            <div className="mt-6 space-y-4">
              {(() => {
                // Get US providers first, then fallback to any available country
                const usProviders = watchProviders.results['US'];
                const providers = usProviders || Object.values(watchProviders.results)[0];

                if (!providers) return null;

                // Deduplicate providers across all categories by name
                // Priority: flatrate > rent > buy (show provider in first category it appears)
                // If one provider name is a subset of another, keep the shorter one
                const seenProviderNames = new Set<string>();

                const getUniqueProviders = (providerList: typeof providers.flatrate) => {
                  if (!providerList) return [];
                  return providerList.filter((provider) => {
                    const providerName = provider.provider_name;
                    const normalizedName = providerName.toLowerCase();

                    // Check if current provider name is a subset of any seen provider name
                    // (e.g., "Apple TV Amazon Channel" contains "Apple TV" - skip the longer one)
                    for (const seenName of seenProviderNames) {
                      const normalizedSeen = seenName.toLowerCase();
                      // If current name includes a seen name (and they're different), skip current
                      if (normalizedName.includes(normalizedSeen) && normalizedName !== normalizedSeen) {
                        return false;
                      }
                      // If seen name includes current name (and they're different), remove seen and keep current
                      if (normalizedSeen.includes(normalizedName) && normalizedName !== normalizedSeen) {
                        seenProviderNames.delete(seenName);
                        // Continue to add current name below
                        break;
                      }
                      // Exact match (case-insensitive) - skip duplicate
                      if (normalizedName === normalizedSeen) {
                        return false;
                      }
                    }

                    // Add to seen providers
                    seenProviderNames.add(providerName);
                    return true;
                  });
                };

                const uniqueFlatrate = getUniqueProviders(providers.flatrate);
                const uniqueRent = getUniqueProviders(providers.rent);
                const uniqueBuy = getUniqueProviders(providers.buy);

                return (
                  <div className="space-y-4">
                    {/* Streaming (Subscription) */}
                    {uniqueFlatrate.length > 0 && (
                      <Card className="p-4">
                        <div className="text-base font-semibold text-foreground mb-2">Where to Stream?</div>
                        <div className="flex flex-wrap gap-2">
                          {uniqueFlatrate.map((provider) => (
                            <div key={provider.provider_id} className="flex items-center">
                              {provider.logo_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                  alt={`${provider.provider_name} logo`}
                                  className="h-10 w-auto object-contain"
                                />
                              ) : (
                                <span className="text-xs font-medium">{provider.provider_name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Rent */}
                    {uniqueRent.length > 0 && (
                      <Card className="p-4">
                        <div className="text-base font-semibold text-foreground mb-2">Where to Rent?</div>
                        <div className="flex flex-wrap gap-2">
                          {uniqueRent.map((provider) => (
                            <div key={provider.provider_id} className="flex items-center">
                              {provider.logo_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                  alt={`${provider.provider_name} logo`}
                                  className="h-10 w-auto object-contain"
                                />
                              ) : (
                                <span className="text-xs font-medium">{provider.provider_name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Buy */}
                    {uniqueBuy.length > 0 && (
                      <Card className="p-4">
                        <div className="text-base font-semibold text-foreground mb-2">Where to Buy?</div>
                        <div className="flex flex-wrap gap-2">
                          {uniqueBuy.map((provider) => (
                            <div key={provider.provider_id} className="flex items-center">
                              {provider.logo_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                  alt={`${provider.provider_name} logo`}
                                  className="h-10 w-auto object-contain"
                                />
                              ) : (
                                <span className="text-xs font-medium">{provider.provider_name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* JustWatch Attribution */}
                    <div className="text-xs text-muted-foreground text-center pt-2">
                    For the US only. Watch provider data provided by {" "}
                      <a
                        href="https://www.justwatch.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        JustWatch
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </aside>

        {/* Details Section */}
        <main className="col-span-12 md:col-span-9 space-y-8">
          {/* Title and Tagline */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
            {movie.tagline && <h2 className="text-lg text-muted-foreground italic">{movie.tagline}</h2>}
          </div>

          {/* Overview */}
          {movie.overview && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase">Overview</h2>
              <p className="text-base leading-relaxed text-foreground/90">{movie.overview}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {movie.status && (
              <Card className="p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Status</div>
                <p className="font-medium">{movie.status}</p>
              </Card>
            )}

            {movie.budget > 0 && (
              <Card className="p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Budget</div>
                <p className="font-medium">${(movie.budget / 1_000_000).toFixed(1)}M</p>
              </Card>
            )}

            {movie.revenue > 0 && (
              <Card className="p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Revenue</div>
                <p className="font-medium">${(movie.revenue / 1_000_000).toFixed(1)}M</p>
              </Card>
            )}

            {movie.original_language && (
              <Card className="p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Language</div>
                <p className="font-medium uppercase">{movie.original_language}</p>
              </Card>
            )}

            {movie.production_countries.length > 0 && (
              <Card className="p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Country</div>
                <p className="font-medium">{movie.production_countries.map((c: { name: any }) => c.name).join(", ")}</p>
              </Card>
            )}

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <Card className="p-4">
                <div className="text-base font-semibold text-foreground mb-2">Production Companies</div>
                <div className="flex flex-wrap gap-2">
                  {movie.production_companies.map((company: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
                    <Badge key={company.id} variant="outline" className="bg-transparent text-white border-primary">
                      {company.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Recommended Movies (Collapsible using shadcn/ui Collapsible) */}
          {recommendedMovies && recommendedMovies.length > 0 && (
            <div className="space-y-4">
              <Collapsible onOpenChange={setShowRecommendedMovies} defaultOpen={showRecommendedMovies}>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase">
                    Recommended Movies
                  </h2>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center ml-1 rounded-md px-2 py-1 bg-muted/70 hover:bg-primary/70 hover:text-primary-foreground text-sm font-medium transition-colors"
                      aria-label="Toggle Recommended Movies"
                    >
                      <ArrowRight
                        className={`transition-transform duration-200 mr-1 ${showRecommendedMovies ? "rotate-90" : "rotate-0"}`}
                        aria-label={showRecommendedMovies ? "Hide recommended movies" : "Show recommended movies"}
                        aria-hidden="true"
                      />
                      <span>Show recommended movies</span>
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-5">
                    {recommendedMovies.slice(0, 8).map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
      
          <CommentSection movieId={id as string}></CommentSection>
        </main>
      </div>
    </div>
    </>
  );
}