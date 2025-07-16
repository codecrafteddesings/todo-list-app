import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Box,
  TextField,
  Chip,
  Stack,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';

const SettingsDialog = ({ open, onClose }) => {
  const { 
    theme, 
    categories, 
    toggleTheme, 
    addCategory, 
    deleteCategory,
    clearCompleted 
  } = useTodo();
  
  const [newCategory, setNewCategory] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.toLowerCase())) {
      addCategory(newCategory.toLowerCase());
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category) => {
    if (categories.length > 1) { // Mantener al menos una categoría
      deleteCategory(category);
    }
  };

  const handleClearCompleted = () => {
    clearCompleted();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const exportData = () => {
    const data = localStorage.getItem('todoApp');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todolist-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result);
          localStorage.setItem('todoApp', JSON.stringify(data));
          window.location.reload(); // Recargar para aplicar los cambios
        } catch (error) {
          console.error('Error importing data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Configuración
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {showAlert && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Tareas completadas eliminadas correctamente
          </Alert>
        )}

        {/* Tema */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Apariencia
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label={`Tema ${theme === 'dark' ? 'oscuro' : 'claro'}`}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Categorías */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Categorías
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Nueva categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleAddCategory}>
                    <AddIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onDelete={categories.length > 1 ? () => handleDeleteCategory(category) : undefined}
                deleteIcon={<DeleteIcon />}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Gestión de datos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Gestión de Datos
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleClearCompleted}
            >
              Limpiar Tareas Completadas
            </Button>
            
            <Button
              variant="outlined"
              onClick={exportData}
            >
              Exportar Datos
            </Button>
            
            <Box>
              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-file"
                type="file"
                onChange={importData}
              />
              <label htmlFor="import-file">
                <Button variant="outlined" component="span">
                  Importar Datos
                </Button>
              </label>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Información */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Información
          </Typography>
          <Typography variant="body2" color="text.secondary">
            TodoList Pro v1.0.0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Una aplicación moderna para gestión de tareas
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
