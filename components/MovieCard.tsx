import { MovieOverview } from "@/lib/types/movie"
import { Card, CardContent } from "./ui/card"
import { getGenreNameById, getImageUrl } from "@/lib/utils"
import Image from "next/image"
import { Star, Check, Eye, Plus } from "lucide-react"
import { useState } from "react"
import { Badge } from "./ui/badge"
import { useRouter } from "next/router"
import { useMovieLists } from "@/lib/movie-lists-context"

export const MovieCard = ({ movie }: { movie: MovieOverview }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    const { addToWatched, addToQueue, isWatched, isInQueue } = useMovieLists();

    const watched = isWatched(movie.id);
    const inQueue = isInQueue(movie.id);

    return (
        <Card
            className={`group cursor-pointer overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-100`}
            onClick={() => router.push(`/movie/${movie.id}`)}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <CardContent className="p-0 relative">
                <div>
                    <div className="relative aspect-[2/3] overflow-hidden">
                        {!movie.poster_path && !movie.backdrop_path ? (
                            <div className="aspect-[2/3] bg-background flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">No image available</p>
                            </div>
                        ) : (
                            <Image
                                src={getImageUrl(movie.poster_path ?? movie.backdrop_path)}
                                alt=""
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                aria-hidden="true"
                            />
                        )}
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
                        <div className="font-semibold text-lg text-balance line-clamp-1">
                            {movie.title}
                        </div>

                        {(() => {
                            const genreNames = (movie.genre_ids || [])
                                .map((id) => getGenreNameById(id))
                                .filter((n): n is string => Boolean(n));
                            return genreNames.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {genreNames.slice(0, 1).map((name) => (
                                        <Badge key={name} variant="secondary" className="px-2 py-0.5 text-xs">
                                            {name}
                                        </Badge>
                                    ))}
                                    {genreNames.length > 1 && (
                                        <Badge variant="outline" className="px-2 py-0.5 text-xs">
                                            +{genreNames.length - 1}
                                        </Badge>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                            <span>
                                { new Date(movie.release_date).getFullYear() ? new Date(movie.release_date).getFullYear() : "Unknown release date"}
                            </span>

                            <div className="flex items-center gap-1.5 text-primary">
                                <Star className="h-4 w-4 fill-primary text-primary" aria-label="Rating" aria-hidden="true" />
                                <span className="font-medium">
                                    {movie.vote_average?.toFixed?.(1) ?? "-"}
                                </span>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {/* Add to Watched Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToWatched(movie);
                                }}
                                disabled={watched}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                    watched 
                                        ? 'bg-green-600 text-white cursor-default' 
                                        : 'bg-secondary hover:bg-green-600 hover:text-white'
                                }`}
                                title={watched ? 'Already watched' : 'Mark as watched'}
                            >
                                {watched ? <Check size={14} aria-label="Watched" /> : <Eye size={14} aria-label="Mark as watched" />}
                                <span>{watched ? 'Watched' : 'Watch'}</span>
                            </button>

                            {/* Add to Queue Button - only show if not watched */}
                            {!watched && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToQueue(movie);
                                    }}
                                    disabled={inQueue}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                        inQueue 
                                            ? 'bg-blue-600 text-white cursor-default' 
                                            : 'bg-secondary hover:bg-blue-600 hover:text-white'
                                    }`}
                                    title={inQueue ? 'Already in queue' : 'Add to queue'}
                                >
                                    {inQueue ? <Check size={14} aria-label="In queue" /> : <Plus size={14} aria-label="Add to queue" />}
                                    <span>{inQueue ? 'Queued' : 'Queue'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};  
