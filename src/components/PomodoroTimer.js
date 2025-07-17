import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as ResetIcon,
  Timer as TimerIcon,
  Coffee as BreakIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import NotificationService from '../services/NotificationService';

const PomodoroTimer = ({ open, onClose, selectedTodo = null }) => {
  const { todos, dispatch } = useTodo();
  const [currentTodo, setCurrentTodo] = useState(selectedTodo);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Configuración de tiempos (en minutos)
  const sessionTimes = useMemo(() => ({
    work: 25,
    shortBreak: 5,
    longBreak: 15
  }), []);

  // Obtener tareas activas para seleccionar
  const activeTodos = todos.filter(todo => !todo.completed);

  useEffect(() => {
    if (selectedTodo) {
      setCurrentTodo(selectedTodo);
    }
  }, [selectedTodo]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    playNotificationSound();
    
    if (currentSession === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Registrar tiempo trabajado en la tarea
      if (currentTodo) {
        const timeWorked = sessionTimes.work * 60; // en segundos
        dispatch({
          type: 'ADD_WORK_TIME',
          payload: {
            id: currentTodo.id,
            timeWorked,
            sessionDate: new Date().toISOString()
          }
        });
      }
      
      // Determinar el siguiente tipo de descanso
      const nextSession = (newCount % 4 === 0) ? 'longBreak' : 'shortBreak';
      setCurrentSession(nextSession);
      setTimeLeft(sessionTimes[nextSession] * 60);
      
      // Notificación
      NotificationService.showNotification({
        title: '🍅 ¡Pomodoro Completado!',
        body: `Tiempo de ${nextSession === 'longBreak' ? 'descanso largo' : 'descanso corto'}`,
        icon: '/logo192.png'
      });
      
    } else {
      // Fin del descanso, volver al trabajo
      setCurrentSession('work');
      setTimeLeft(sessionTimes.work * 60);
      setSessionCount(prev => prev + 1);
      
      NotificationService.showNotification({
        title: '⚡ ¡Descanso Terminado!',
        body: 'Es hora de volver al trabajo',
        icon: '/logo192.png'
      });
    }
  }, [currentSession, completedPomodoros, currentTodo, dispatch, sessionTimes]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleSessionComplete]);

  const playNotificationSound = () => {
    // Crear un sonido de notificación simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    
    // Registrar tiempo parcial si hay una tarea activa
    if (currentTodo && currentSession === 'work') {
      const elapsedTime = startTimeRef.current ? 
        Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      
      if (elapsedTime > 60) { // Solo registrar si trabajó más de 1 minuto
        dispatch({
          type: 'ADD_WORK_TIME',
          payload: {
            id: currentTodo.id,
            timeWorked: elapsedTime,
            sessionDate: new Date().toISOString()
          }
        });
      }
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(sessionTimes[currentSession] * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionTimes.work * 60);
    setCurrentSession('work');
    setCompletedPomodoros(0);
    setSessionCount(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = sessionTimes[currentSession] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'primary';
      case 'shortBreak': return 'success';
      case 'longBreak': return 'info';
      default: return 'primary';
    }
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work': return <TaskIcon />;
      case 'shortBreak': return <BreakIcon />;
      case 'longBreak': return <BreakIcon />;
      default: return <TimerIcon />;
    }
  };

  const getSessionLabel = () => {
    switch (currentSession) {
      case 'work': return 'Trabajo';
      case 'shortBreak': return 'Descanso Corto';
      case 'longBreak': return 'Descanso Largo';
      default: return 'Sesión';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TimerIcon />
          Temporizador Pomodoro
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box textAlign="center" sx={{ py: 2 }}>
          {/* Indicador de sesión actual */}
          <Chip
            icon={getSessionIcon()}
            label={getSessionLabel()}
            color={getSessionColor()}
            size="large"
            sx={{ mb: 3, fontSize: '1.1rem', py: 2 }}
          />
          
          {/* Timer principal */}
          <Box position="relative" display="inline-flex" sx={{ mb: 3 }}>
            <CircularProgress
              variant="determinate"
              value={getProgress()}
              size={200}
              thickness={6}
              color={getSessionColor()}
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              bottom={0}
              right={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Typography variant="h3" fontWeight="bold" color={`${getSessionColor()}.main`}>
                {formatTime(timeLeft)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentSession === 'work' ? 'minutos de trabajo' : 'minutos de descanso'}
              </Typography>
            </Box>
          </Box>
          
          {/* Progreso de la sesión */}
          <Box sx={{ mb: 3, mx: 2 }}>
            <LinearProgress
              variant="determinate"
              value={getProgress()}
              color={getSessionColor()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          {/* Tarea actual */}
          {currentSession === 'work' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tarea actual:
              </Typography>
              
              {currentTodo ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {currentTodo.title}
                  </Typography>
                  {currentTodo.description && (
                    <Typography variant="body2" color="text.secondary">
                      {currentTodo.description}
                    </Typography>
                  )}
                </Alert>
              ) : (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Seleccionar tarea</InputLabel>
                  <Select
                    value={currentTodo?.id || ''}
                    label="Seleccionar tarea"
                    onChange={(e) => {
                      const selectedTodo = activeTodos.find(t => t.id === e.target.value);
                      setCurrentTodo(selectedTodo);
                    }}
                  >
                    <MenuItem value="">Sin tarea específica</MenuItem>
                    {activeTodos.map(todo => (
                      <MenuItem key={todo.id} value={todo.id}>
                        {todo.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
          
          {/* Estadísticas */}
          <Box display="flex" justifyContent="center" gap={4} sx={{ mb: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {completedPomodoros}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pomodoros completados
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {sessionCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sesiones totales
              </Typography>
            </Box>
          </Box>
          
          {/* Controles */}
          <Box display="flex" justifyContent="center" gap={2}>
            {!isRunning ? (
              <IconButton
                onClick={handleStart}
                size="large"
                color={getSessionColor()}
                sx={{ bgcolor: `${getSessionColor()}.light`, '&:hover': { bgcolor: `${getSessionColor()}.main` } }}
              >
                <PlayIcon sx={{ fontSize: 40 }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={handlePause}
                size="large"
                color="warning"
                sx={{ bgcolor: 'warning.light', '&:hover': { bgcolor: 'warning.main' } }}
              >
                <PauseIcon sx={{ fontSize: 40 }} />
              </IconButton>
            )}
            
            <IconButton
              onClick={handleStop}
              size="large"
              color="error"
              sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main' } }}
            >
              <StopIcon sx={{ fontSize: 40 }} />
            </IconButton>
            
            <IconButton
              onClick={handleReset}
              size="large"
              color="inherit"
              sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.400' } }}
            >
              <ResetIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
          
          {/* Próxima sesión */}
          {currentSession === 'work' && completedPomodoros > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Próximo descanso: {(completedPomodoros + 1) % 4 === 0 ? 'Largo (15 min)' : 'Corto (5 min)'}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        {currentTodo && currentSession === 'work' && (
          <Button
            onClick={() => {
              dispatch({
                type: 'TOGGLE_TODO',
                payload: currentTodo.id
              });
              setCurrentTodo(null);
            }}
            variant="contained"
            color="success"
          >
            Marcar como Completada
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PomodoroTimer;
