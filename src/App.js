import React, { useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Snackbar,
  Alert,
  Fab,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  GetApp as ExportIcon,
  Analytics as AnalyticsIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  CloudUpload as ImportIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import { TodoProvider, useTodo } from './context/TodoContext';
import { lightTheme, darkTheme } from './styles/theme';
import Header from './components/Header';
import TodoList from './components/TodoList';
import AddTodoFab from './components/AddTodoFab';
import ExportDialog from './components/ExportDialog';
import ImportDialog from './components/ImportDialog';
import AnalyticsPanel from './components/AnalyticsPanel';
import PomodoroTimer from './components/PomodoroTimer';
import AdvancedSettingsDialog from './components/AdvancedSettingsDialog';
import NotificationService from './services/NotificationService';
import OfflineService from './services/OfflineService';

// Configurar dayjs en español
dayjs.locale('es');

// Componente principal de la aplicación
const AppContent = () => {
  const [gearMenuAnchor, setGearMenuAnchor] = React.useState(null);
  const handleGearClick = (event) => setGearMenuAnchor(event.currentTarget);
  const handleGearClose = () => setGearMenuAnchor(null);
  const { theme, error, todos } = useTodo();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState('tasks'); // 'tasks', 'analytics'
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [pomodoroOpen, setPomodoroOpen] = React.useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = React.useState(false);
  const [selectedTodoForPomodoro] = React.useState(null);

  // Inicializar servicios
  useEffect(() => {
    // Inicializar notificaciones
    NotificationService.init();
    
    // Configurar handler para clicks en notificaciones
    NotificationService.setNotificationClickHandler((todoId) => {
      // Aquí puedes implementar navegación a la tarea específica
      console.log('Clicked notification for todo:', todoId);
    });

    // Programar notificaciones para tareas existentes
    todos.forEach(todo => {
      if (!todo.completed && todo.dueDate) {
        NotificationService.scheduleNotification(todo);
      }
    });

    // Cargar datos offline
    OfflineService.loadSyncQueue();
  }, [todos]);

  // Mostrar errores en snackbar
  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  // Registrar service worker para PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <CssBaseline />
        
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Header />
          
          {/* Contenido principal */}
          <Container
            maxWidth="lg"
            sx={{
              flex: 1,
              py: 3,
              px: { xs: 2, sm: 3 },
            }}
            id="todo-list-container"
          >
            {currentView === 'tasks' ? (
              <TodoList />
            ) : (
              <AnalyticsPanel />
            )}
          </Container>
          
          {/* Botón flotante para agregar */}
          <AddTodoFab />
          
          {/* Speed Dial para funciones avanzadas */}
          <Fab
            color="primary"
            aria-label="configuración"
            onClick={handleGearClick}
            size="small"
            sx={{
              position: 'fixed',
              bottom: { xs: 60, sm: 70 },
              right: { xs: 14, sm: 16 },
              zIndex: 1000,
              boxShadow: 4,
              width: 34,
              height: 34,
              minHeight: 34,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiSvgIcon-root': {
                fontSize: 18,
              },
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.08)',
              },
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </Fab>
          <Menu
            anchorEl={gearMenuAnchor}
            open={Boolean(gearMenuAnchor)}
            onClose={handleGearClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { setCurrentView(currentView === 'analytics' ? 'tasks' : 'analytics'); handleGearClose(); }}>
              <AnalyticsIcon sx={{ mr: 1 }} /> Análisis
            </MenuItem>
            <MenuItem onClick={() => { setExportDialogOpen(true); handleGearClose(); }}>
              <ExportIcon sx={{ mr: 1 }} /> Exportar
            </MenuItem>
            <MenuItem onClick={() => { setImportDialogOpen(true); handleGearClose(); }}>
              <ImportIcon sx={{ mr: 1 }} /> Importar
            </MenuItem>
            <MenuItem onClick={() => { setPomodoroOpen(true); handleGearClose(); }}>
              <TimerIcon sx={{ mr: 1 }} /> Pomodoro
            </MenuItem>
          </Menu>

          {/* Diálogos */}
          <ExportDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
          />
          
          <ImportDialog
            open={importDialogOpen}
            onClose={() => setImportDialogOpen(false)}
          />
          
          <PomodoroTimer
            open={pomodoroOpen}
            onClose={() => setPomodoroOpen(false)}
            selectedTodo={selectedTodoForPomodoro}
          />
          
          <AdvancedSettingsDialog
            open={advancedSettingsOpen}
            onClose={() => setAdvancedSettingsOpen(false)}
          />
          
          {/* Snackbar para errores */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity="error"
              variant="filled"
            >
              {error}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Componente App con Provider
function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;
