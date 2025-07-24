import React, { useState } from "react";
import { useTodo } from "../context/TodoContext";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const { todos } = useTodo();
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="w-full">
      <div className="bg-white/90 shadow-xl rounded-3xl p-6 md:p-8 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
            Mis Tareas
          </h2>
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full shadow hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all"
            onClick={() => setShowForm(true)}
          >
            + Nueva tarea
          </button>
        </div>
        {showForm && <TodoForm onClose={() => setShowForm(false)} />}
        <div className="space-y-3 mt-4">
          {todos.length === 0 ? (
            <div className="text-gray-400 text-center py-8 italic">
              Sin tareas de heno aún.
            </div>
          ) : (
            todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
          )}
        </div>
      </div>
    </section>
  );
}
