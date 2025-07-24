import React, { useState } from "react";
import { useTodo } from "../context/TodoContext";

export default function TodoForm({ onClose }) {
  const { addTodo } = useTodo();
  const [text, setText] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo({ text, description: desc });
    setText("");
    setDesc("");
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 shadow-2xl rounded-2xl p-4 md:p-6 mb-4 border border-gray-100 animate-fade-in"
    >
      <input
        className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg w-full mb-3 text-lg placeholder-gray-400 transition"
        placeholder="Título de la tarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <textarea
        className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 p-3 rounded-lg w-full mb-3 text-base placeholder-gray-300 transition"
        placeholder="Descripción (opcional)"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2 justify-end mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all"
        >
          Agregar
        </button>
      </div>
    </form>
  );
}
