import { createContext, useContext, ReactNode } from "react";
import { useMovieLists as useMovieListsBase } from "./movie-lists";

const MovieListsContext = createContext<ReturnType<typeof useMovieListsBase> | null>(null);

export const MovieListsProvider = ({ children }: { children: ReactNode }) => {
  const value = useMovieListsBase();
  return (
    <MovieListsContext.Provider value={value}>
      {children}
    </MovieListsContext.Provider>
  );
};

export const useMovieLists = () => {
  const ctx = useContext(MovieListsContext);
  if (!ctx) {
    throw new Error("useMovieLists must be used within a MovieListsProvider");
  }
  return ctx;
};
