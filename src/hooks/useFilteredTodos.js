import { useMemo } from 'react';
import { useTodo } from '../context/TodoContext';
import { filterTodos, sortTodos } from '../utils/helpers';

export const useFilteredTodos = () => {
  const { todos, filter, searchTerm, sortBy } = useTodo();

  const filteredAndSortedTodos = useMemo(() => {
    const filtered = filterTodos(todos, filter, searchTerm);
    return sortTodos(filtered, sortBy);
  }, [todos, filter, searchTerm, sortBy]);

  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const overdue = todos.filter(todo => 
      !todo.completed && 
      todo.dueDate && 
      new Date(todo.dueDate) < new Date()
    ).length;

    return {
      total,
      completed,
      active,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todos]);

  return {
    todos: filteredAndSortedTodos,
    stats: todoStats
  };
};
