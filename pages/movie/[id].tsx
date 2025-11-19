import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getMovieDetailsQuery } from "@/lib/external"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, Star, Calendar, Users } from "lucide-react"
import { genresList } from "@/lib/utils"
import { CommentSection } from "@/components/CommentSection"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"

export default function MovieDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: movie, isLoading } = getMovieDetailsQuery(id as string)

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

  if (!isClient || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  const getGenreNames = (genreIds: number[]) => {
    return genreIds.map((id) => genresList.find((g) => g.id === id)?.name).filter(Boolean)
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null

  return (
    <div className="min-h-screen">
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button variant="outline" className="mb-8 gap-2 bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Poster Section */}
            <aside className="col-span-12 md:col-span-3">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
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
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Based on {movie.vote_count?.toLocaleString()} votes
                  </span>
                </div>

                {releaseYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{releaseYear}</span>
                  </div>
                )}

                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{movie.runtime} minutes</span>
                  </div>
                )}
              </Card>
            </aside>

            {/* Details Section */}
            <main className="col-span-12 md:col-span-9 space-y-8">
              {/* Title and Tagline */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && <p className="text-lg text-muted-foreground italic">{movie.tagline}</p>}
              </div>

              {/* Genres */}
              {movie.genre_ids && movie.genre_ids.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase">Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {getGenreNames(movie.genre_ids).map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Status</div>
                    <p className="font-medium">{movie.status}</p>
                  </Card>
                )}

                {movie.budget > 0 && (
                  <Card className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Budget</div>
                    <p className="font-medium">${(movie.budget / 1_000_000).toFixed(1)}M</p>
                  </Card>
                )}

                {movie.revenue > 0 && (
                  <Card className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Revenue</div>
                    <p className="font-medium">${(movie.revenue / 1_000_000).toFixed(1)}M</p>
                  </Card>
                )}

                {movie.original_language && (
                  <Card className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Language</div>
                    <p className="font-medium uppercase">{movie.original_language}</p>
                  </Card>
                )}

                {movie.production_countries.length > 0 && (
                  <Card className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Country</div>
                    <p className="font-medium">{movie.production_countries.map((c: { name: any }) => c.name).join(", ")}</p>
                  </Card>
                )}
              </div>

              {/* Production Companies */}
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase">Production Companies</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.production_companies.map((company: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
                      <Badge key={company.id} variant="outline">
                        {company.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* <CommentSection movieId={id as string}></CommentSection> */}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}