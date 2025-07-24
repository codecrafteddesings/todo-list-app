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
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
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
    dueTime: null,
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
        dueTime: initialData.dueTime ? dayjs(initialData.dueTime) : null,
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const todoData = {
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
      dueTime: formData.dueTime ? formData.dueTime.format('HH:mm') : null
    };
    const validation = validateTodo(todoData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    if (isEditing && initialData) {
      updateTodo(initialData.id, todoData);
    } else {
      addTodo(todoData);
    }
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
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 0, p: 0 }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Título de la tarea"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            error={!!errors.text}
            helperText={errors.text}
            required
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 2
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
            minRows={2}
            maxRows={4}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 2
              }
            }}
          />
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  label="Categoría"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}
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
              <FormControl fullWidth size="small">
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}
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
                    size: 'small',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2
                      }
                    }
                  },
                  popper: {
                    placement: 'top',
                    sx: {
                      zIndex: 1400,
                      '& .MuiPaper-root': {
                        marginBottom: '8px',
                        boxShadow: 3,
                        borderRadius: 3,
                        minWidth: '250px',
                        maxWidth: '250px',
                      },
                      '& .MuiDateCalendar-root': {
                        maxHeight: '250px',
                        width: '250px',
                        margin: 0,
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        minHeight: '36px',
                        marginBottom: '4px',
                      },
                      '& .MuiDayCalendar-header': {
                        marginBottom: '4px',
                      },
                      '& .MuiDayCalendar-weekDayLabel': {
                        width: '24px',
                        height: '24px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      },
                      '& .MuiPickersDay-root': {
                        width: '24px',
                        height: '24px',
                        fontSize: '0.75rem',
                        margin: '1px',
                      },
                      '& .MuiPickersCalendarHeader-label': {
                        fontSize: '0.95rem',
                        fontWeight: 600,
                      },
                      '& .MuiPickersArrowSwitcher-root': {
                        '& .MuiIconButton-root': {
                          padding: '4px',
                        }
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        margin: '2px 0',
                      }
                    }
                  }
                }}
              />
              <TimePicker
                label="Hora de vencimiento (opcional)"
                value={formData.dueTime}
                onChange={(newValue) => handleInputChange('dueTime', newValue)}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: {
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2
                      }
                    }
                  },
                  popper: {
                    placement: 'top',
                    sx: {
                      zIndex: 1400,
                      '& .MuiPaper-root': {
                        marginBottom: '8px',
                        boxShadow: 3,
                        borderRadius: 3,
                        minWidth: '250px',
                        maxWidth: '250px',
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
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="outlined"
              onClick={onSubmit}
              sx={{ minWidth: 90, fontWeight: 500 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 110, fontWeight: 'bold' }}
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

