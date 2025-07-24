import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { todoReducer, initialState } from './todoReducer';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { requestNotificationPermission, scheduleTaskNotification } from '../utils/notifications';

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

  // Solicitar permiso de notificación al cargar la app
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const addTodo = (todoData) => {
    const newTodo = {
      id: uuidv4(),
      title: todoData.title || todoData.text, // Soporte para ambos nombres
      text: todoData.text || todoData.title,
      description: todoData.description || '',
      category: todoData.category || 'personal',
      priority: todoData.priority || 'medium',
      dueDate: todoData.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      tags: todoData.tags || [],
      workTime: 0, // Tiempo trabajado en segundos
      pomodoroSessions: [] // Registro de sesiones pomodoro
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
    scheduleTaskNotification(newTodo);
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
      // Programar notificación si la tarea editada tiene fecha/hora
      if (updates.dueDate && updates.dueTime) {
        const dueDateTime = new Date(updates.dueDate);
        const [hours, minutes] = updates.dueTime.split(":");
        dueDateTime.setHours(Number(hours));
        dueDateTime.setMinutes(Number(minutes));
        import("../utils/notifications").then(({ scheduleNotification }) => {
          scheduleNotification({
            title: updates.text,
            body: `Tienes una tarea pendiente: ${updates.text}`,
            time: dueDateTime
          });
        });
      }
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

  const addWorkTime = (todoId, timeWorked, sessionData) => {
    dispatch({ 
      type: 'ADD_WORK_TIME', 
      payload: { 
        id: todoId, 
        timeWorked, 
        sessionDate: sessionData?.sessionDate || new Date().toISOString(),
        sessionType: sessionData?.sessionType || 'pomodoro'
      } 
    });
  };

  const clearAllTodos = () => {
    dispatch({ type: 'CLEAR_ALL_TODOS' });
  };

  const importTodos = (todos) => {
    dispatch({ type: 'IMPORT_TODOS', payload: todos });
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
    clearCompleted,
    addWorkTime,
    clearAllTodos,
    importTodos,
    dispatch // Exportar dispatch para casos especiales
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
