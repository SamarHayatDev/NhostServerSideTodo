"use client";
// MoviesFetching.tsx
import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import MovieCard from "./MovieCard";

const GET_MOVIES = gql`
  query {
    movies {
      id
      title
      director
      release_year
      genre
      rating
    }
  }
`;

const MoviesFetching = () => {
  const { loading, error, data } = useQuery(GET_MOVIES);
  const [moviesFromStorage, setMoviesFromStorage] = useState([]);

  // Save to local storage when data is fetched
  useEffect(() => {
    if (data && data.movies) {
      localStorage.setItem("movies", JSON.stringify(data.movies));
      setMoviesFromStorage(data.movies); // Update state with fetched data
    }
  }, [data]);

  // On component mount, check local storage for existing data
  useEffect(() => {
    const storedMovies = localStorage.getItem("movies");
    if (storedMovies) {
      setMoviesFromStorage(JSON.parse(storedMovies));
    }
  }, []);

  // if (loading && moviesFromStorage.length === 0) {
  //   return <p className="text-center text-blue-500">Loading...</p>;
  // }

  if (error && moviesFromStorage.length === 0) {
    return <p className="text-center text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">
        Movies List
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(data ? data.movies : moviesFromStorage).map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default MoviesFetching;
