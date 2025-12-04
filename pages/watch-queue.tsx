import { useRouter } from "next/router";
import { Menubar } from "@/components/ui/menubar"
import { MenubarMenu, MenubarTrigger } from "@radix-ui/react-menubar";
import { motion } from 'framer-motion';
import { useMovieLists } from '@/lib/movie-lists-context';
import { Trash2, Check } from 'lucide-react';
import Image from 'next/image';

export default function WatchQueue(){
    const router = useRouter(); 
    const { queue, removeFromQueue, addToWatched } = useMovieLists();

    const handleMarkAsWatched = (movie: any) => {
        addToWatched(movie);
    };

    console.log(handleMarkAsWatched);

    return(
        <div className="flex flex-col items-center min-h-screen p-6">
            {/* Navigation Bar */}
            <Menubar className="mx-auto flex gap-4 mb-8">
                <MenubarMenu>
                    <MenubarTrigger 
                        className="hover:bg-primary hover:text-black rounded-md px-4 py-2"
                        onClick={() => router.push("/profile-page")}>
                        Profile
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger 
                        className="hover:bg-primary hover:text-black rounded-md px-4 py-2"
                        onClick={() => router.push("/watched")}>
                        Watched
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger 
                        className="bg-primary text-black rounded-md px-4 py-2"
                        onClick={() => router.push("/watch-queue")}>
                        Movie Queue
                    </MenubarTrigger>
                </MenubarMenu>
            </Menubar>

            {/* Movies Grid */}
            <motion.div
                initial={{x: "100%"}}
                animate={{x: 0}}
                exit={{x: "-100%"}}
                transition={{duration: 0.6}}
                className="w-full max-w-7xl overflow-hidden"
            >
                <h1 className="text-3xl font-bold mb-6">Movie Queue</h1>
                
                {queue.length === 0 ? (
                    <div className="text-center text-gray-500 mt-12">
                        <p className="text-xl">Your queue is empty</p>
                        <p className="mt-2">Add movies you want to watch!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {queue.map((movie) => (
                            <motion.div
                                key={movie.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group cursor-pointer "
                            >
                                <div className="relative aspect-[2/3] rounded-lg">
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                    
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-80">
                                        <button
                                            onClick={() => handleMarkAsWatched(movie)}
                                            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                                            aria-label="Mark as watched"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => removeFromQueue(movie.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
                                            aria-label="Remove from queue"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-2">
                                    <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
