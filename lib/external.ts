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
    const filteredResults = data.results.filter((movie: MovieOverview) => !!movie.release_date);
    return filteredResults;
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
    const filteredResults = data.results.filter((movie: MovieOverview) => !!movie.release_date);
    return filteredResults;
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

// Search movies by query
const searchMovies = async (
    query: string, 
    pageNumber: number,
    language?: string,
    year?: string
) => {
    if (!query.trim()) {
        return { results: [], total_pages: 0, total_results: 0 };
    }
    const params = new URLSearchParams();
    params.set('query', query);
    params.set('include_adult', 'false');
    params.set('language', language || 'en-US');
    if (year) params.set('year', year);
    params.set('page', String(pageNumber));
    
    const url = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
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
    const data = await response.json() as { results: MovieOverview[]; total_pages: number; total_results: number };
    const filteredResults = data.results.filter((movie: MovieOverview) => !!movie.release_date);
    return {results: filteredResults, total_pages: data.total_pages, total_results: data.total_results};
}

export const searchMoviesQuery = (
    query: string, 
    pageNumber: number,
    language?: string,
    year?: string
) => {
    return useQuery({
        queryKey: ['search-movies', query, pageNumber, language, year],
        queryFn: () => searchMovies(query, pageNumber, language, year),
        enabled: query.trim().length > 0,
    });
}