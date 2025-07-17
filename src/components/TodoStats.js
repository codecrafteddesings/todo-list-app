import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useFilteredTodos } from '../hooks/useFilteredTodos';
import { useTodo } from '../context/TodoContext';
import { isOverdue, isDueToday } from '../utils/helpers';

const StatsCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Box color={`${color}.main`}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TodoStats = () => {
  const { todos } = useTodo();
  const { stats } = useFilteredTodos();

  // Calcular estadísticas adicionales
  const todayTodos = todos.filter(todo => 
    !todo.completed && todo.dueDate && isDueToday(todo.dueDate)
  );
  
  const overdueTodos = todos.filter(todo => 
    !todo.completed && todo.dueDate && isOverdue(todo.dueDate)
  );

  const priorityStats = {
    high: todos.filter(todo => !todo.completed && todo.priority === 'high').length,
    medium: todos.filter(todo => !todo.completed && todo.priority === 'medium').length,
    low: todos.filter(todo => !todo.completed && todo.priority === 'low').length,
  };

  const categoryStats = todos.reduce((acc, todo) => {
    if (!todo.completed) {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Resumen de Productividad
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Progreso Total"
            value={`${stats.completionRate}%`}
            subtitle={`${stats.completed} de ${stats.total} completadas`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Para Hoy"
            value={todayTodos.length}
            subtitle="tareas programadas"
            icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Completadas"
            value={stats.completed}
            subtitle="tareas finalizadas"
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Vencidas"
            value={overdueTodos.length}
            subtitle="requieren atención"
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Barra de progreso */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progreso Semanal
          </Typography>
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={stats.completionRate}
              sx={{ height: 10, borderRadius: 5 }}
              color="primary"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {stats.completed} tareas completadas de {stats.total} totales
          </Typography>
        </CardContent>
      </Card>

      {/* Estadísticas por prioridad */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tareas por Prioridad
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={`Alta: ${priorityStats.high}`}
              color="error"
              variant={priorityStats.high > 0 ? "filled" : "outlined"}
            />
            <Chip
              label={`Media: ${priorityStats.medium}`}
              color="warning"
              variant={priorityStats.medium > 0 ? "filled" : "outlined"}
            />
            <Chip
              label={`Baja: ${priorityStats.low}`}
              color="success"
              variant={priorityStats.low > 0 ? "filled" : "outlined"}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Estadísticas por categoría */}
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tareas por Categoría
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.entries(categoryStats).map(([category, count]) => (
              <Chip
                key={category}
                label={`${category}: ${count}`}
                variant="outlined"
                color="primary"
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TodoStats;
