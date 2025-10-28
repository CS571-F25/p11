
import { getTrendingMoviesQuery } from "@/lib/external"
import { MovieCard } from "./MovieCard"


export function FeaturedMovies() {
  const { data: entries } = getTrendingMoviesQuery(1)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {entries && entries.slice(0, 4).map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
