import { MovieOverview } from "@/lib/types/movie"
import { Card, CardContent } from "./ui/card"
import { getGenreNameById, getImageUrl } from "@/lib/utils"
import Image from "next/image"
import { Star } from "lucide-react"
import { useState } from "react"
import { Badge } from "./ui/badge"

export const MovieCard = ({ movie }: { movie: MovieOverview }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card
            className={`group cursor-pointer overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-100`}
            onClick={() => setIsExpanded((v) => !v)}
        >
            <CardContent className="p-0 relative">
                <div>
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                            src={getImageUrl(movie.poster_path)}
                            alt={movie.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top overlay with gradient and overview text */}
                        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-250 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-background/100 via-background/80 to-transparent" />
                            <div className="absolute top-0 left-0 right-0 p-4">
                                <p className="text-sm text-white/90 leading-relaxed line-clamp-[8]">
                                    {movie.overview}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h4 className="font-semibold text-lg text-balance line-clamp-1">
                            {movie.title}
                        </h4>

                        {(() => {
                            const genreNames = (movie.genre_ids || [])
                                .map((id) => getGenreNameById(id))
                                .filter((n): n is string => Boolean(n));
                            return genreNames.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {genreNames.slice(0, 2).map((name) => (
                                        <Badge key={name} variant="secondary" className="px-2 py-0.5 text-xs">
                                            {name}
                                        </Badge>
                                    ))}
                                    {genreNames.length > 2 && (
                                        <Badge variant="outline" className="px-2 py-0.5 text-xs">
                                            +{genreNames.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                            <span>
                                {new Date(movie.release_date).getFullYear()}
                            </span>

                            <div className="flex items-center gap-1.5 text-primary">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-medium">
                                    {movie.vote_average?.toFixed?.(1) ?? "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};  