"use client";
import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { nhost } from "@/lib/nhost";

// Define the mutation for inserting a movie
const INSERT_MOVIE = gql`
  mutation InsertMovie($title: String!) {
    insert_movies_one(object: { title: $title }) {
      title
    }
  }
`;

const AddMovie: React.FC = () => {
  const [title, setTitle] = useState("");
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
      await addMovie({ variables: { title } });
      setTitle(""); // Clear input after successful mutation
    } catch (err) {
      console.error("Error adding movie:", err);
    }
  };

  return (
    <div className="p-4">
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
