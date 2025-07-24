import React from "react";
import { useTodo } from "../context/TodoContext";

export default function TodoItem({ todo }) {
  const { toggleTodo, deleteTodo } = useTodo();
  return (
    <div className="flex items-center justify-between bg-white/90 border border-gray-100 rounded-xl shadow-sm px-4 py-3 group transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
          className="accent-indigo-600 w-5 h-5 rounded-full border-2 border-indigo-300 focus:ring-2 focus:ring-indigo-200 transition"
        />
        <div>
          <div
            className={
              todo.completed
                ? "line-through text-gray-400"
                : "font-semibold text-gray-800"
            }
          >
            {todo.text}
          </div>
          {todo.description && (
            <div className="text-xs text-gray-500 mt-0.5">
              {todo.description}
            </div>
          )}
        </div>
      </div>
      <button
        className="opacity-60 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition"
        onClick={() => deleteTodo(todo.id)}
        title="Eliminar tarea"
      >
        Eliminar
      </button>
    </div>
  );
}
