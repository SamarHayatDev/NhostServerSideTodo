"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { useFileUpload, useNhostClient } from "@nhost/nextjs";

interface TodoFormProps {
  fetchTodos: () => void;
}

export default function TodoForm({ fetchTodos }: TodoFormProps) {
  const [todoTitle, setTodoTitle] = useState("");
  const [todoAttachment, setTodoAttachment] = useState<File | null>(null);
  const nhostClient = useNhostClient();
  const { upload } = useFileUpload();

  const createTodo = `
    mutation($title: String!, $file_id: uuid) {
      insert_todos_one(object: {title: $title, file_id: $file_id}) {
        id
      }
    }
  `;

  const handleCreateTodo = async (e: FormEvent) => {
    e.preventDefault();

    let todo = { title: todoTitle };
    if (todoAttachment) {
      const { id, error } = await upload({
        file: todoAttachment,
        name: todoAttachment.name,
      });

      if (error) {
        console.error("Error uploading file:", error);
        return;
      }

      todo.file_id = id;
    }

    const { error } = await nhostClient.graphql.request(createTodo, todo);

    if (error) {
      console.error("Error creating todo:", error);
      return;
    }

    setTodoTitle("");
    setTodoAttachment(null);
    fetchTodos(); // Call fetchTodos to update the list
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTodoTitle(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTodoAttachment(e.target.files[0]);
    }
  };

  return (
    <div className="form-section mb-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Add a new TODO
      </h2>
      <form onSubmit={handleCreateTodo} className="space-y-4">
        <div className="input-group">
          <label
            htmlFor="title"
            className="block text-sm font-semibold mb-2 text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter title"
            value={todoTitle}
            onChange={handleTitleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="input-group">
          <label
            htmlFor="file"
            className="block text-sm font-semibold mb-2 text-gray-700"
          >
            File (optional)
          </label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="submit-group">
          <button
            type="submit"
            disabled={!todoTitle}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            Add Todo
          </button>
        </div>
      </form>
    </div>
  );
}
