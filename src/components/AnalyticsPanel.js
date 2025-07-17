import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Assignment,
  Speed,
  DateRange,
  Category,
  PriorityHigh
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import { format, subDays, isAfter, isBefore, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const AnalyticsPanel = () => {
  const { todos } = useTodo();
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');

  // Filtrar datos según rango de tiempo
  const getFilteredData = () => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'day':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = startOfWeek(now, { locale: es });
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case 'quarter':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }
    
    return todos.filter(todo => 
      isAfter(new Date(todo.createdAt), startDate) && 
      isBefore(new Date(todo.createdAt), now)
    );
  };

  const filteredTodos = getFilteredData();

  // Análisis de productividad
  const getProductivityAnalysis = () => {
    const completed = filteredTodos.filter(t => t.completed);
    const pending = filteredTodos.filter(t => !t.completed);
    const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
    
    const completionRate = filteredTodos.length > 0 
      ? Math.round((completed.length / filteredTodos.length) * 100) 
      : 0;

    // Análisis por día de la semana
    const dayStats = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    dayNames.forEach(day => {
      dayStats[day] = { created: 0, completed: 0 };
    });

    filteredTodos.forEach(todo => {
      const dayName = dayNames[new Date(todo.createdAt).getDay()];
      dayStats[dayName].created++;
      if (todo.completed) {
        dayStats[dayName].completed++;
      }
    });

    return {
      totalTasks: filteredTodos.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      completionRate,
      dayStats,
      avgTasksPerDay: filteredTodos.length / 7
    };
  };

  // Análisis de categorías
  const getCategoryAnalysis = () => {
    const categoryStats = {};
    
    filteredTodos.forEach(todo => {
      const category = todo.category || 'Sin categoría';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0
        };
      }
      
      categoryStats[category].total++;
      if (todo.completed) {
        categoryStats[category].completed++;
      } else {
        categoryStats[category].pending++;
        if (todo.dueDate && new Date(todo.dueDate) < new Date()) {
          categoryStats[category].overdue++;
        }
      }
    });

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      ...stats,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));
  };

  // Análisis de prioridades
  const getPriorityAnalysis = () => {
    const priorityStats = {
      high: { total: 0, completed: 0, avgCompletionTime: 0 },
      medium: { total: 0, completed: 0, avgCompletionTime: 0 },
      low: { total: 0, completed: 0, avgCompletionTime: 0 }
    };

    filteredTodos.forEach(todo => {
      const priority = todo.priority || 'low';
      priorityStats[priority].total++;
      
      if (todo.completed && todo.completedAt) {
        priorityStats[priority].completed++;
        const completionTime = new Date(todo.completedAt) - new Date(todo.createdAt);
        priorityStats[priority].avgCompletionTime += completionTime;
      }
    });

    // Calcular tiempo promedio de completado
    Object.keys(priorityStats).forEach(priority => {
      const stats = priorityStats[priority];
      if (stats.completed > 0) {
        stats.avgCompletionTime = Math.round(
          (stats.avgCompletionTime / stats.completed) / (1000 * 60 * 60 * 24)
        ); // En días
      }
    });

    return priorityStats;
  };

  // Tendencias temporales
  const getTemporalTrends = () => {
    const trends = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    last7Days.forEach(date => {
      trends[date] = {
        created: 0,
        completed: 0,
        date: format(new Date(date), 'EEE dd/MM', { locale: es })
      };
    });

    todos.forEach(todo => {
      const createdDate = format(new Date(todo.createdAt), 'yyyy-MM-dd');
      if (trends[createdDate]) {
        trends[createdDate].created++;
      }
      
      if (todo.completed && todo.completedAt) {
        const completedDate = format(new Date(todo.completedAt), 'yyyy-MM-dd');
        if (trends[completedDate]) {
          trends[completedDate].completed++;
        }
      }
    });

    return Object.values(trends);
  };

  const productivityData = getProductivityAnalysis();
  const categoryData = getCategoryAnalysis();
  const priorityData = getPriorityAnalysis();
  const trendsData = getTemporalTrends();

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="600">
          📊 Análisis Avanzado
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeRange}
            label="Período"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Último día</MenuItem>
            <MenuItem value="week">Última semana</MenuItem>
            <MenuItem value="month">Último mes</MenuItem>
            <MenuItem value="quarter">Último trimestre</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Productividad" icon={<TrendingUp />} />
        <Tab label="Categorías" icon={<Category />} />
        <Tab label="Prioridades" icon={<PriorityHigh />} />
        <Tab label="Tendencias" icon={<DateRange />} />
      </Tabs>

      {/* Panel de Productividad */}
      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          {/* Métricas principales */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Assignment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {productivityData.totalTasks}
                    </Typography>
                    <Typography variant="body2">Total Tareas</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      value={productivityData.completionRate}
                      size={60}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {productivityData.completionRate}%
                    </Typography>
                    <Typography variant="body2">Completado</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {productivityData.pending}
                    </Typography>
                    <Typography variant="body2">Pendientes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Speed color="error" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {Math.round(productivityData.avgTasksPerDay)}
                    </Typography>
                    <Typography variant="body2">Tareas/día</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Estadísticas por día */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Productividad por Día
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(productivityData.dayStats).map(([day, stats]) => (
                    <Box key={day}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">{day}</Typography>
                        <Typography variant="body2">
                          {stats.completed}/{stats.created}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.created > 0 ? (stats.completed / stats.created) * 100 : 0}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Panel de Categorías */}
      <TabPanel value={selectedTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Análisis por Categorías
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Completadas</TableCell>
                    <TableCell align="right">Pendientes</TableCell>
                    <TableCell align="right">Vencidas</TableCell>
                    <TableCell align="right">% Completado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryData.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell>
                        <Chip label={category.category} variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{category.total}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={category.completed} 
                          color="success" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">{category.pending}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={category.overdue} 
                          color="error" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={category.completionRate}
                            sx={{ flexGrow: 1, height: 6 }}
                          />
                          <Typography variant="body2">
                            {category.completionRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Panel de Prioridades */}
      <TabPanel value={selectedTab} index={2}>
        <Grid container spacing={3}>
          {Object.entries(priorityData).map(([priority, stats]) => {
            const priorityColors = {
              high: 'error',
              medium: 'warning', 
              low: 'success'
            };
            const priorityLabels = {
              high: 'Alta Prioridad',
              medium: 'Media Prioridad',
              low: 'Baja Prioridad'
            };
            
            return (
              <Grid item xs={12} md={4} key={priority}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {priorityLabels[priority]}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h3" color={`${priorityColors[priority]}.main`}>
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        tareas totales
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                        color={priorityColors[priority]}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {stats.completed} completadas ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
                      </Typography>
                    </Box>
                    
                    {stats.avgCompletionTime > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Tiempo promedio: {stats.avgCompletionTime} días
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      {/* Panel de Tendencias */}
      <TabPanel value={selectedTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tendencias de los Últimos 7 Días
            </Typography>
            <Grid container spacing={2}>
              {trendsData.map((day, index) => (
                <Grid item xs={12/7} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {day.date}
                      </Typography>
                      <Box sx={{ my: 1 }}>
                        <Typography variant="h6" color="primary.main">
                          +{day.created}
                        </Typography>
                        <Typography variant="caption">creadas</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          ✓{day.completed}
                        </Typography>
                        <Typography variant="caption">completadas</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default AnalyticsPanel;
