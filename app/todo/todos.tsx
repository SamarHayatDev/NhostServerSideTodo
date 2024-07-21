"use client";

import { useState, useEffect } from "react";
import { nhost } from "../../lib/nhost";
import { useNhostClient, useAccessToken } from "@nhost/nextjs";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

export interface Todo {
  id: string;
  title: string;
  file_id?: any;
  completed: boolean;
  accessTokens?: any;
}

export default function Todos() {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);

  const accessToken = useAccessToken();
  nhost.graphql.setAccessToken(accessToken);
  nhost.storage.setAccessToken(accessToken);
  const nhostClient = useNhostClient();

  const getTodos = `
    query {
      todos {
        id
        title
        file_id
        completed
      }
    }
  `;

  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await nhostClient.graphql.request(getTodos);

    if (error) {
      console.error("Error fetching todos:", error);
      setLoading(false);
      return;
    }

    setTodos(data.todos);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTodos();
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const signOutFunction = () => {
    nhost.auth
      .signOut()
      .then(() => {
        alert("clicked");
        window.location.reload(); // Refresh the page after signing out
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="container max-w-lg bg-white shadow-md rounded-lg p-6">
        <TodoForm fetchTodos={fetchTodos} />
        {loading ? (
          <div className="todo-item p-4 text-center text-gray-600">
            Loading...
          </div>
        ) : (
          <TodoList todos={todos} fetchTodos={fetchTodos} />
        )}
      </div>
      <div className="sign-out-section mt-8">
        <button
          type="button"
          onClick={signOutFunction}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
