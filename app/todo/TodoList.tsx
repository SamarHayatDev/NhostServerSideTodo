import { useNhostClient } from "@nhost/nextjs";
import { Todo } from "./Todos";

interface TodoListProps {
  todos: Todo[];
  fetchTodos: () => void;
}

export default function TodoList({ todos, fetchTodos }: TodoListProps) {
  const nhostClient = useNhostClient();

  const deleteTodo = `
    mutation($id: uuid!) {
      delete_todos_by_pk(id: $id) {
        id
      }
    }
  `;

  const deleteAllTodos = `
    mutation {
      delete_todos(where: {}) {
        affected_rows
      }
    }
  `;

  const completeTodoMutation = `
    mutation($id: uuid!) {
      update_todos_by_pk(pk_columns: {id: $id}, _set: {completed: true}) {
        completed
      }
    }
  `;

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this TODO?")) {
      return;
    }

    const todo = todos.find((todo) => todo.id === id);
    if (todo?.file_id) {
      await nhostClient.storage.delete({ fileId: todo.file_id });
    }

    const { error } = await nhostClient.graphql.request(deleteTodo, { id });
    if (error) {
      console.error("Error deleting todo:", error);
    }

    fetchTodos(); // Call fetchTodos to update the list
  };

  const handleDeleteAllTodos = async () => {
    if (!window.confirm("Are you sure you want to delete all TODOs?")) {
      return;
    }

    const { error } = await nhostClient.graphql.request(deleteAllTodos);
    if (error) {
      console.error("Error deleting all todos:", error);
    }

    fetchTodos(); // Call fetchTodos to update the list
  };

  const completeTodo = async (id: string) => {
    const { error } = await nhostClient.graphql.request(completeTodoMutation, {
      id,
    });

    if (error) {
      console.error("Error completing todo:", error);
    }

    fetchTodos(); // Call fetchTodos to update the list
  };

  const openAttachment = async (todo: Todo) => {
    const { presignedUrl, error } = await nhostClient.storage.getPresignedUrl({
      fileId: todo.file_id as any,
    });

    if (error) {
      console.error("Error getting presigned URL:", error);
      return;
    }

    window.open(presignedUrl.url, "_blank");
  };

  return (
    <div className="todos-section space-y-4">
      {todos.map((todo) => (
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
            className={`flex-1 ${
              todo.completed ? "line-through text-gray-500" : "text-gray-800"
            }`}
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
      ))}
      {todos.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDeleteAllTodos}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
          >
            Delete All Todos
          </button>
        </div>
      )}
    </div>
  );
}
