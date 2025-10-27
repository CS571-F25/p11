import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

const movies = [
  {
    id: 1,
    title: "How To Train Your Dragon",
    rating: 8.5,
    year: 2024,
    image: "/dragon.webp",
  },
  {
    id: 2,
    title: "Dr. Death Cutthroat Conman",
    rating: 7.9,
    year: 2024,
    image: "/death.webp",
  },
  {
    id: 3,
    title: "The Grinch",
    rating: 8.2,
    year: 2024,
    image: "/grinch.webp",
  },
  {
    id: 4,
    title: "Shrek",
    rating: 8.7,
    year: 2024,
    image: "/shrek.webp",
  },
]

export function FeaturedMovies() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {movies.map((movie) => (
        <Card
          key={movie.id}
          className="group cursor-pointer overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300"
        >
          <CardContent className="p-0">
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={movie.image}
                alt={movie.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-semibold text-balance line-clamp-1">{movie.title}</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{movie.year}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-accent" />
                  <span className="font-medium">{movie.rating}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
