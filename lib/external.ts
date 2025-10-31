import { useQuery } from "@tanstack/react-query";
import { MovieOverview } from "./types/movie";

const getTrendingMovies = async (pageNumber: number) => {
    const url = `https://api.themoviedb.org/3/trending/movie/week?language=en-US&page=${pageNumber}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`
        }
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as { results: MovieOverview[] };
    return data.results;
}


export const getTrendingMoviesQuery = (pageNumber: number) => {
    return useQuery({
        queryKey: ['trending-movies', pageNumber],
        queryFn: () => getTrendingMovies(pageNumber),
    });
}

// Advanced: allow choosing time window while keeping the same underlying route
const getTrendingMoviesByWindow = async (
    pageNumber: number,
    timeWindow: 'day' | 'week'
) => {
    const url = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?language=en-US&page=${pageNumber}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`
        }
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as { results: MovieOverview[] };
    console.log(data.results);
    return data.results;
}

export const getTrendingMoviesQueryAdvanced = (
    pageNumber: number,
    timeWindow: 'day' | 'week'
) => {
    return useQuery({
        queryKey: ['trending-movies', timeWindow, pageNumber],
        queryFn: () => getTrendingMoviesByWindow(pageNumber, timeWindow),
    });
}