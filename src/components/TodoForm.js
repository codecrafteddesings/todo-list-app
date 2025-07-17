import React, { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Button,
  Grid,
  Autocomplete,
  Stack,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTodo } from '../context/TodoContext';
import { validateTodo } from '../utils/helpers';

const TodoForm = ({ initialData = null, onSubmit, isEditing = false }) => {
  const { addTodo, updateTodo, categories } = useTodo();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate: null,
    tags: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        text: initialData.text || '',
        description: initialData.description || '',
        category: initialData.category || 'personal',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate ? dayjs(initialData.dueDate) : null,
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const todoData = {
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null
    };
    
    const validation = validateTodo(todoData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit form
    if (isEditing && initialData) {
      updateTodo(initialData.id, todoData);
    } else {
      addTodo(todoData);
    }

    // Reset form if not editing
    if (!isEditing) {
      setFormData({
        text: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        dueDate: null,
        tags: []
      });
    }

    onSubmit?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <Stack spacing={3}>
          {/* Campos principales */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Información básica
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Título de la tarea"
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                error={!!errors.text}
                helperText={errors.text}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={isMobile ? 2 : 3}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper'
                  }
                }}
              />
            </Stack>
          </Paper>

          {/* Configuración y fecha */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Configuración
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={formData.category}
                    label="Categoría"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    sx={{
                      backgroundColor: 'background.paper'
                    }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Prioridad"
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    sx={{
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <MenuItem value="low">Baja</MenuItem>
                    <MenuItem value="medium">Media</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="Fecha de vencimiento (opcional)"
                  value={formData.dueDate}
                  onChange={(newValue) => handleInputChange('dueDate', newValue)}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dueDate,
                      helperText: errors.dueDate,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper'
                        }
                      }
                    },
                    popper: {
                      placement: isMobile ? 'bottom' : 'bottom-start',
                      sx: {
                        zIndex: 1400,
                        '& .MuiPaper-root': {
                          marginTop: '8px',
                          boxShadow: 3,
                        },
                        '& .MuiDateCalendar-root': {
                          maxHeight: isMobile ? '300px' : '350px',
                          width: isMobile ? '280px' : '320px',
                          margin: 0,
                        },
                        '& .MuiPickersCalendarHeader-root': {
                          paddingLeft: '16px',
                          paddingRight: '16px',
                          minHeight: '48px',
                          marginBottom: '8px',
                        },
                        '& .MuiDayCalendar-header': {
                          marginBottom: '8px',
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        },
                        '& .MuiPickersDay-root': {
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px',
                          fontSize: '0.875rem',
                          margin: '2px',
                        },
                        '& .MuiPickersCalendarHeader-label': {
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        },
                        '& .MuiPickersArrowSwitcher-root': {
                          '& .MuiIconButton-root': {
                            padding: '8px',
                          }
                        },
                        '& .MuiDayCalendar-weekContainer': {
                          margin: '4px 0',
                        }
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formData.tags}
                  onChange={(event, newValue) => handleInputChange('tags', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                        size="small"
                        color="primary"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Etiquetas (opcional)"
                      placeholder="Presiona Enter para agregar etiquetas"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper'
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Botones */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={onSubmit}
              sx={{ minWidth: 100 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                minWidth: 100,
                fontWeight: 'bold'
              }}
            >
              {isEditing ? 'Actualizar' : 'Agregar'} Tarea
            </Button>
          </Box>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default TodoForm;
