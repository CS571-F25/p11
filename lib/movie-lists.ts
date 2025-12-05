import { useState, useEffect } from 'react';
import { MovieOverview } from './types/movie';

interface MovieLists {
  watched: MovieOverview[];
  queue: MovieOverview[];
}

export const useMovieLists = () => {
  const [lists, setLists] = useState<MovieLists>({
    watched: [],
    queue: []
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedWatched = localStorage.getItem('watchedMovies');
    const savedQueue = localStorage.getItem('movieQueue');
    
    setLists({
      watched: savedWatched ? JSON.parse(savedWatched) : [],
      queue: savedQueue ? JSON.parse(savedQueue) : []
    });
  }, []);

  // Add to watched
  const addToWatched = (movie: MovieOverview) => {
    setLists(prev => {
      const newWatched = [...prev.watched];
      const exists = newWatched.some(m => m.id === movie.id);
      
      if (!exists) {
        newWatched.push(movie);
        localStorage.setItem('watchedMovies', JSON.stringify(newWatched));
      }
      
      // Remove from queue if it exists there
      const newQueue = prev.queue.filter(m => m.id !== movie.id);
      localStorage.setItem('movieQueue', JSON.stringify(newQueue));
      
      return { watched: newWatched, queue: newQueue };
    });
  };

  // Add to queue
  const addToQueue = (movie: MovieOverview) => {
    setLists(prev => {
      const newQueue = [...prev.queue];
      const exists = newQueue.some(m => m.id === movie.id);
      const alreadyWatched = prev.watched.some(m => m.id === movie.id);
      
      if (!exists && !alreadyWatched) {
        newQueue.push(movie);
        localStorage.setItem('movieQueue', JSON.stringify(newQueue));
      }
      
      return { ...prev, queue: newQueue };
    });
  };

  // Remove from watched
  const removeFromWatched = (movieId: number) => {
    setLists(prev => {
      const newWatched = prev.watched.filter(m => m.id !== movieId);
      localStorage.setItem('watchedMovies', JSON.stringify(newWatched));
      return { ...prev, watched: newWatched };
    });
  };

  // Remove from queue
  const removeFromQueue = (movieId: number) => {
    setLists(prev => {
      const newQueue = prev.queue.filter(m => m.id !== movieId);
      localStorage.setItem('movieQueue', JSON.stringify(newQueue));
      return { ...prev, queue: newQueue };
    });
  };

  // Check if movie is in watched
  const isWatched = (movieId: number) => {
    return lists.watched.some(m => m.id === movieId);
  };

  // Check if movie is in queue
  const isInQueue = (movieId: number) => {
    return lists.queue.some(m => m.id === movieId);
  };

  return {
    watched: lists.watched,
    queue: lists.queue,
    addToWatched,
    addToQueue,
    removeFromWatched,
    removeFromQueue,
    isWatched,
    isInQueue
  };
};
