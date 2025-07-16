import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { todoReducer, initialState } from './todoReducer';
import { saveToStorage, loadFromStorage } from '../utils/storage';

const TodoContext = createContext();

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState, (initial) => {
    const saved = loadFromStorage('todoApp');
    return saved || initial;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('todoApp', state);
  }, [state]);

  const addTodo = (todoData) => {
    const newTodo = {
      id: uuidv4(),
      text: todoData.text,
      description: todoData.description || '',
      category: todoData.category || 'personal',
      priority: todoData.priority || 'medium',
      dueDate: todoData.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: todoData.tags || []
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };

  const updateTodo = (id, updates) => {
    dispatch({ 
      type: 'UPDATE_TODO', 
      payload: { 
        id, 
        updates: { 
          ...updates, 
          updatedAt: new Date().toISOString() 
        } 
      } 
    });
  };

  const deleteTodo = (id) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  const toggleTodo = (id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  const setFilter = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setSearchTerm = (searchTerm) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm });
  };

  const setSortBy = (sortBy) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const addCategory = (category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const deleteCategory = (category) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: category });
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const clearCompleted = () => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  };

  const value = {
    ...state,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
    setSearchTerm,
    setSortBy,
    addCategory,
    deleteCategory,
    toggleTheme,
    clearCompleted
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
