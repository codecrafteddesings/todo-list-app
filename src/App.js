import React, { useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import { TodoProvider, useTodo } from './context/TodoContext';
import { lightTheme, darkTheme } from './styles/theme';
import Header from './components/Header';
import TodoList from './components/TodoList';
import AddTodoFab from './components/AddTodoFab';

// Configurar dayjs en español
dayjs.locale('es');

// Componente principal de la aplicación
const AppContent = () => {
  const { theme, error } = useTodo();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

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
          >
            <TodoList />
          </Container>
          
          {/* Botón flotante para agregar */}
          <AddTodoFab />
          
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
