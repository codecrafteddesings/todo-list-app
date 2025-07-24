import React from "react";
import { useTodo } from "../context/TodoContext";

export default function TodoStats() {
  const { todos } = useTodo();
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex justify-around items-center bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl p-4 mb-6 text-sm shadow border border-gray-100">
      <div className="text-center">
        <div className="font-bold text-blue-700 text-lg">{total}</div>
        <div className="text-gray-500">Total</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-yellow-600 text-lg">{active}</div>
        <div className="text-gray-500">Pendientes</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-green-600 text-lg">{completed}</div>
        <div className="text-gray-500">Completadas</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-indigo-600 text-lg">{percent}%</div>
        <div className="text-gray-500">Progreso</div>
      </div>
    </div>
  );
}
