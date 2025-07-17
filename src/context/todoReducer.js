export const initialState = {
  todos: [],
  filter: 'all', // 'all', 'active', 'completed', 'today', 'week'
  searchTerm: '',
  sortBy: 'createdAt', // 'createdAt', 'dueDate', 'priority', 'alphabetical'
  categories: ['personal', 'work', 'shopping', 'health'],
  theme: 'light', // 'light', 'dark'
  isLoading: false,
  error: null
};

export const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload]
      };

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, ...action.payload.updates }
            : todo
        )
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { 
                ...todo, 
                completed: !todo.completed,
                completedAt: !todo.completed ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
              }
            : todo
        )
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };

    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload
      };

    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat !== action.payload),
        todos: state.todos.map(todo =>
          todo.category === action.payload
            ? { ...todo, category: 'personal' }
            : todo
        )
      };

    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };

    case 'ADD_WORK_TIME':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? {
                ...todo,
                workTime: (todo.workTime || 0) + action.payload.timeWorked,
                pomodoroSessions: [
                  ...(todo.pomodoroSessions || []),
                  {
                    date: action.payload.sessionDate,
                    timeWorked: action.payload.timeWorked,
                    type: action.payload.sessionType || 'pomodoro'
                  }
                ],
                updatedAt: new Date().toISOString()
              }
            : todo
        )
      };

    case 'CLEAR_ALL_TODOS':
      return {
        ...state,
        todos: []
      };

    case 'IMPORT_TODOS':
      return {
        ...state,
        todos: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};
