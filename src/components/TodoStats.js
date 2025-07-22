import React, { useState } from 'react';
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

  // Carrusel horizontal simple (scroll manual) con dots
  const cards = [
    {
      title: "Progreso Total",
      value: `${stats.completionRate}%`,
      subtitle: `${stats.completed} de ${stats.total} completadas`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "primary"
    },
    {
      title: "Para Hoy",
      value: todayTodos.length,
      subtitle: "tareas programadas",
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: "info"
    },
    {
      title: "Completadas",
      value: stats.completed,
      subtitle: "tareas finalizadas",
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: "success"
    },
    {
      title: "Vencidas",
      value: overdueTodos.length,
      subtitle: "requieren atención",
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: "error"
    }
  ];
  // Estado para dot activo
  const [activeIndex, setActiveIndex] = useState(0);
  // Detectar scroll y actualizar dot
  const carouselRef = React.useRef();
  React.useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = 260 + 16; // minWidth + margin
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(idx);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="600" textAlign="center">
        Resumen de Productividad
      </Typography>

      {/* Carrusel horizontal simple con dots en móvil/tablet */}
      <Box
        sx={{
          mb: 3,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Box
          ref={carouselRef}
          sx={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            pb: 1,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {cards.map((card, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'inline-block',
                minWidth: 260,
                mr: 2,
                scrollSnapAlign: 'center',
                verticalAlign: 'top',
              }}
            >
              <StatsCard {...card} />
            </Box>
          ))}
        </Box>
        {/* Dots indicadores */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          {cards.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                mx: 0.5,
                backgroundColor: idx === activeIndex ? 'primary.main' : 'grey.400',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Grid centrado y distribuido en desktop */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 3, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}
        textAlign="center"
      >
        <Grid item md={3} display="flex" justifyContent="center">
          <StatsCard {...cards[0]} />
        </Grid>
        <Grid item md={3} display="flex" justifyContent="center">
          <StatsCard {...cards[1]} />
        </Grid>
        <Grid item md={3} display="flex" justifyContent="center">
          <StatsCard {...cards[2]} />
        </Grid>
        <Grid item md={3} display="flex" justifyContent="center">
          <StatsCard {...cards[3]} />
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
}

export default TodoStats;
