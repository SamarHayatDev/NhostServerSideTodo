"use client";
import React from "react";

const MovieCard = ({ movie }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
    <div className="p-4">
      <h2 className="text-xl font-semibold text-green-500 mb-2">
        {movie.title}
      </h2>
      <p className="text-gray-700 mb-1">
        <strong>Director:</strong> {movie.director}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Release Year:</strong> {movie.release_year}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Genre:</strong> {movie.genre}
      </p>
      <p className="text-gray-700">
        <strong>Rating:</strong> {movie.rating}
      </p>
    </div>
  </div>
);

export default MovieCard;
