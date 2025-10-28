import { MovieOverview } from "@/lib/types/movie"
import { Card, CardContent } from "./ui/card"
import { getImageUrl } from "@/lib/utils"
import Image from "next/image"
import { Star } from "lucide-react"
import { useState } from "react"

export const MovieCard = ({ movie }: { movie: MovieOverview }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <Card
            className={`group cursor-pointer overflow-hidden border-border/50 bg-card hover:border-primary/50 perspective-1000 transition-all duration-700`}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <CardContent className="p-0 relative transform-style-preserve-3d">
                {/* Front of card */}
                <div className="backface-hidden">
                    {!isFlipped && (
                        <div className="relative aspect-[2/3] overflow-hidden">
                            <Image
                                src={getImageUrl(movie.poster_path)}
                                alt={movie.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    )}
                    <div className="p-4 rounded-lg bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h4 className="font-semibold text-lg text-balance line-clamp-1">
                            {movie.title}
                        </h4>

                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                            <span>
                                {isFlipped ? new Date(movie.release_date).toDateString().split(" ").slice(1).join(" ") : new Date(movie.release_date).getFullYear()}
                            </span>

                            <div className="flex items-center gap-1.5 text-primary">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-medium">
                                    {movie.vote_average?.toFixed?.(1) ?? "-"}
                                </span>
                            </div>
                        </div>

                        {isFlipped && (
                            <div className="mt-3">
                                <p className="text-sm text-white line-clamp-[8] leading-relaxed">
                                    {movie.overview}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};  