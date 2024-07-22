"use client";
import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { nhost } from "@/lib/nhost";

// Define the mutation for inserting a movie
const INSERT_MOVIE = gql`
  mutation InsertMovie(
    $title: String!
    $director: String!
    $genre: String!
    $rating: float8! # Updated to float8
    $release_year: Int!
  ) {
    insert_movies_one(
      object: {
        title: $title
        director: $director
        genre: $genre
        rating: $rating
        release_year: $release_year
      }
    ) {
      title
    }
  }
`;

const AddMovie: React.FC = () => {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState(0);
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [addMovie, { loading, error, data }] = useMutation(INSERT_MOVIE, {
    context: {
      headers: {
        Authorization: `Bearer ${nhost.auth.getAccessToken()}`,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMovie({
        variables: {
          title,
          director,
          genre,
          rating,
          release_year: releaseYear,
        },
      });
      setTitle("");
      setDirector("");
      setGenre("");
      setRating(0);
      setReleaseYear(new Date().getFullYear());
    } catch (err) {
      console.error("Error adding movie:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Movie</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2">
            Movie Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="director" className="block text-gray-700 mb-2">
            Director
          </label>
          <input
            id="director"
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="genre" className="block text-gray-700 mb-2">
            Genre
          </label>
          <input
            id="genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="rating" className="block text-gray-700 mb-2">
            Rating
          </label>
          <input
            id="rating"
            type="number"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="releaseYear" className="block text-gray-700 mb-2">
            Release Year
          </label>
          <input
            id="releaseYear"
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Movie"}
        </button>
      </form>
      {data && (
        <p className="mt-4 text-green-500">
          Movie "{data.insert_movies_one.title}" added successfully!
        </p>
      )}
      {error && <p className="mt-4 text-red-500">Error: {error.message}</p>}
    </div>
  );
};

export default AddMovie;
