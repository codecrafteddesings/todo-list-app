import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  TaskAlt as TaskAltIcon,
  SearchOff as SearchOffIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';

const EmptyState = ({ filter, searchTerm, onAddTask }) => {
  const { setFilter, setSearchTerm } = useTodo();

  const getEmptyStateContent = () => {
    if (searchTerm) {
      return {
        icon: <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary' }} />,
        title: 'No se encontraron resultados',
        subtitle: `No hay tareas que coincidan con "${searchTerm}"`,
        actionText: 'Limpiar búsqueda',
        action: () => setSearchTerm(''),
      };
    }

    switch (filter) {
      case 'completed':
        return {
          icon: <TaskAltIcon sx={{ fontSize: 80, color: 'success.main' }} />,
          title: '¡Sin tareas completadas aún!',
          subtitle: 'Completa algunas tareas para verlas aquí',
          actionText: 'Ver todas las tareas',
          action: () => setFilter('all'),
        };
      case 'active':
        return {
          icon: <TaskAltIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
          title: '¡Todas las tareas completadas!',
          subtitle: 'Excelente trabajo, no tienes tareas pendientes',
          actionText: 'Agregar nueva tarea',
          action: onAddTask,
        };
      case 'today':
        return {
          icon: <TaskAltIcon sx={{ fontSize: 80, color: 'warning.main' }} />,
          title: 'No hay tareas para hoy',
          subtitle: 'Disfruta de tu día libre o programa algo nuevo',
          actionText: 'Agregar tarea para hoy',
          action: onAddTask,
        };
      case 'week':
        return {
          icon: <TaskAltIcon sx={{ fontSize: 80, color: 'info.main' }} />,
          title: 'No hay tareas para esta semana',
          subtitle: 'Planifica tu semana agregando nuevas tareas',
          actionText: 'Agregar tarea para esta semana',
          action: onAddTask,
        };
      case 'overdue':
        return {
          icon: <TaskAltIcon sx={{ fontSize: 80, color: 'success.main' }} />,
          title: '¡No hay tareas vencidas!',
          subtitle: 'Estás al día con todas tus responsabilidades',
          actionText: 'Ver todas las tareas',
          action: () => setFilter('all'),
        };
      default:
        return {
          icon: <AddIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
          title: 'Comienza tu lista de tareas',
          subtitle: 'Agrega tu primera tarea y mantente organizado',
          actionText: 'Agregar primera tarea',
          action: onAddTask,
        };
    }
  };

  const { icon, title, subtitle, actionText } = getEmptyStateContent();

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        textAlign: 'center',
        p: 4,
        backgroundColor: 'background.default',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box mb={3}>
        {icon}
      </Box>
      
      <Typography variant="h5" gutterBottom fontWeight="500">
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" mb={4}>
        {subtitle}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={filter === 'all' && !searchTerm ? <AddIcon /> : null}
        onClick={getEmptyStateContent().action}
      >
        {actionText}
      </Button>
    </Paper>
  );
};

export default EmptyState;
