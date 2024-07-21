"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { nhost } from '../../lib/nhost';
import { useNhostClient, useAccessToken, useFileUpload } from '@nhost/nextjs';

const deleteTodo = `
    mutation($id: uuid!) {
      delete_todos_by_pk(id: $id) {
        id
      }
    }
  `;
const createTodo = `
    mutation($title: String!, $file_id: uuid) {
      insert_todos_one(object: {title: $title, file_id: $file_id}) {
        id
      }
    }
  `;
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

interface Todo {
  id: string;
  title: string;
  file_id?: any;
  completed: boolean;
  accessTokens?: any;
}

export default function Todos() {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoAttachment, setTodoAttachment] = useState<File | null>(null);

  const accessToken = useAccessToken();
  nhost.graphql.setAccessToken(accessToken);
  nhost.storage.setAccessToken(accessToken);
  const nhostClient = useNhostClient();
  const { upload } = useFileUpload();

  // Define fetchTodos function
  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await nhostClient.graphql.request(getTodos);

    if (error) {
      console.error('Error fetching todos:', error);
      return;
    }

    setTodos(data.todos);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos(); // Fetch todos on component mount
  }, [nhostClient]);

  const handleCreateTodo = async (e: FormEvent) => {
    e.preventDefault();

    let todo = { title: todoTitle };
    if (todoAttachment) {
      const { id, error } = await upload({
        file: todoAttachment,
        name: todoAttachment.name,
      });

      if (error) {
        console.error('Error uploading file:', error);
        return;
      }

      todo.file_id = id;
    }

    const { error } = await nhostClient.graphql.request(createTodo, todo);

    if (error) {
      console.error('Error creating todo:', error);
      return;
    }

    setTodoTitle('');
    setTodoAttachment(null);
    fetchTodos(); // Call fetchTodos to update the list
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this TODO?')) {
      return;
    }

    const todo = todos.find((todo) => todo.id === id);
    if (todo?.file_id) {
      await nhostClient.storage.delete({ fileId: todo.file_id });
    }

    const { error } = await nhostClient.graphql.request(deleteTodo, { id });
    if (error) {
      console.error('Error deleting todo:', error);
    }

    fetchTodos(); // Call fetchTodos to update the list
  };

  const completeTodo = async (id: string) => {
    const { error } = await nhostClient.graphql.request(
      `
      mutation($id: uuid!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {completed: true}) {
          completed
        }
      }
    `,
      { id }
    );

    if (error) {
      console.error('Error completing todo:', error);
    }

    fetchTodos(); // Call fetchTodos to update the list
  };

  const openAttachment = async (todo: Todo) => {
    const { presignedUrl, error } = await nhostClient.storage.getPresignedUrl({
      fileId: todo.file_id as any,
    });

    if (error) {
      console.error('Error getting presigned URL:', error);
      return;
    }

    window.open(presignedUrl.url, '_blank');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="container max-w-lg bg-white shadow-md rounded-lg p-6">
        <div className="form-section mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Add a new TODO</h2>
          <form onSubmit={handleCreateTodo} className="space-y-4">
            <div className="input-group">
              <label htmlFor="title" className="block text-sm font-semibold mb-2 text-gray-700">Title</label>
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
              <label htmlFor="file" className="block text-sm font-semibold mb-2 text-gray-700">File (optional)</label>
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
        <div className="todos-section space-y-4">
          {loading ? (
            <div className="todo-item p-4 text-center text-gray-600">Loading...</div>
          ) : (
            todos.map((todo) => (
              <div
                className="todo-item flex items-center space-x-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
                key={todo.id}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  disabled={todo.completed}
                  id={`todo-${todo.id}`}
                  onChange={() => completeTodo(todo.id)}
                  className="mr-3"
                />
                {todo.file_id && (
                  <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => openAttachment(todo)}
                  >
                    Open Attachment
                  </span>
                )}
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                >
                  {todo.title}
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sign-out-section mt-8">
        <button
          type="button"
          onClick={() => nhostClient.auth.signOut()}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
