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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTodo } from '../context/TodoContext';
import { validateTodo } from '../utils/helpers';

const TodoForm = ({ initialData = null, onSubmit, isEditing = false }) => {
  const { addTodo, updateTodo, categories } = useTodo();
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

  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      tags: newValue
    }));
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
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título de la tarea"
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              error={!!errors.text}
              helperText={errors.text}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.category}
                label="Categoría"
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
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
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha de vencimiento"
              value={formData.dueDate}
              onChange={(newValue) => handleInputChange('dueDate', newValue)}
              minDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags}
              onChange={handleTagsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Etiquetas"
                  placeholder="Agregar etiqueta..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="submit" variant="contained" color="primary">
                {isEditing ? 'Actualizar' : 'Agregar'} Tarea
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default TodoForm;
