import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.locale('es');

// Date formatting utilities
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

export const isOverdue = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const isDueToday = (date) => {
  return dayjs(date).isToday();
};

export const isDueTomorrow = (date) => {
  return dayjs(date).isTomorrow();
};

export const isDueThisWeek = (date) => {
  return dayjs(date).isBefore(dayjs().add(7, 'day')) && dayjs(date).isAfter(dayjs());
};

export const getDaysUntilDue = (date) => {
  return dayjs(date).diff(dayjs(), 'day');
};

// Priority utilities
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#f44336';
    case 'medium':
      return '#ff9800';
    case 'low':
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

export const getPriorityWeight = (priority) => {
  switch (priority) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
};

// Category utilities
export const getCategoryColor = (category) => {
  const colors = {
    personal: '#2196f3',
    work: '#673ab7',
    shopping: '#ff5722',
    health: '#4caf50',
    education: '#ff9800',
    family: '#e91e63',
    travel: '#00bcd4',
    finance: '#795548'
  };
  return colors[category] || '#9e9e9e';
};

// Filter and sort utilities
export const filterTodos = (todos, filter, searchTerm = '') => {
  let filtered = todos;

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(todo =>
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Apply status filter
  switch (filter) {
    case 'active':
      return filtered.filter(todo => !todo.completed);
    case 'completed':
      return filtered.filter(todo => todo.completed);
    case 'today':
      return filtered.filter(todo => 
        !todo.completed && todo.dueDate && isDueToday(todo.dueDate)
      );
    case 'week':
      return filtered.filter(todo => 
        !todo.completed && todo.dueDate && isDueThisWeek(todo.dueDate)
      );
    case 'overdue':
      return filtered.filter(todo => 
        !todo.completed && todo.dueDate && isOverdue(todo.dueDate)
      );
    default:
      return filtered;
  }
};

export const sortTodos = (todos, sortBy) => {
  const sorted = [...todos];
  
  switch (sortBy) {
    case 'dueDate':
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return dayjs(a.dueDate).diff(dayjs(b.dueDate));
      });
    case 'priority':
      return sorted.sort((a, b) => 
        getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
      );
    case 'alphabetical':
      return sorted.sort((a, b) => a.text.localeCompare(b.text));
    case 'createdAt':
    default:
      return sorted.sort((a, b) => 
        dayjs(b.createdAt).diff(dayjs(a.createdAt))
      );
  }
};

// Validation utilities
export const validateTodo = (todo) => {
  const errors = {};
  
  if (!todo.text || todo.text.trim().length === 0) {
    errors.text = 'El título es requerido';
  }
  
  if (todo.text && todo.text.length > 100) {
    errors.text = 'El título no puede tener más de 100 caracteres';
  }
  
  if (todo.description && todo.description.length > 500) {
    errors.description = 'La descripción no puede tener más de 500 caracteres';
  }
  
  if (todo.dueDate && dayjs(todo.dueDate).isBefore(dayjs(), 'day')) {
    errors.dueDate = 'La fecha de vencimiento no puede ser en el pasado';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
