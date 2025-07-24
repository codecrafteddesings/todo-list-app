import { TodoProvider } from "./context/TodoContext";
import TodoList from "./components/TodoList";

function App() {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex flex-col items-center">
        <header className="w-full max-w-2xl px-4 pt-8 pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg tracking-tight mb-2">
            Aplicación Todo
          </h1>
          <p className="text-center text-lg text-gray-500 font-medium mb-4">
            Organiza tu día con estilo premium y minimalista
          </p>
        </header>
        <main className="w-full max-w-2xl px-4 flex-1">
          <TodoList />
        </main>
        <footer className="text-xs text-gray-400 py-4">
          Hecho con Tailwind CSS
        </footer>
      </div>
    </TodoProvider>
  );
}

export default App;
