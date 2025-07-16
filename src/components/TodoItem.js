import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import { 
  formatDate, 
  isOverdue, 
  isDueToday, 
  getPriorityColor, 
  getCategoryColor 
} from '../utils/helpers';
import TodoForm from './TodoForm';

const TodoItem = ({ todo }) => {
  const { toggleTodo, deleteTodo } = useTodo();
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    deleteTodo(todo.id);
    setDeleteDialogOpen(false);
  };

  const getDueDateColor = () => {
    if (!todo.dueDate) return 'default';
    if (isOverdue(todo.dueDate)) return 'error';
    if (isDueToday(todo.dueDate)) return 'warning';
    return 'success';
  };

  const getDueDateText = () => {
    if (!todo.dueDate) return null;
    if (isOverdue(todo.dueDate)) return `Vencido: ${formatDate(todo.dueDate)}`;
    if (isDueToday(todo.dueDate)) return 'Vence hoy';
    return `Vence: ${formatDate(todo.dueDate)}`;
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 2,
          opacity: todo.completed ? 0.7 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Checkbox
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              color="primary"
              sx={{ mt: -1 }}
            />
            
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                {todo.text}
              </Typography>
              
              {todo.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}
                >
                  {todo.description}
                </Typography>
              )}
              
              <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                {/* Category Chip */}
                <Chip
                  icon={<CategoryIcon />}
                  label={todo.category}
                  size="small"
                  sx={{
                    backgroundColor: getCategoryColor(todo.category),
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                
                {/* Priority Chip */}
                <Chip
                  icon={<FlagIcon />}
                  label={todo.priority}
                  size="small"
                  sx={{
                    backgroundColor: getPriorityColor(todo.priority),
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                
                {/* Due Date Chip */}
                {todo.dueDate && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={getDueDateText()}
                    size="small"
                    color={getDueDateColor()}
                    variant={isOverdue(todo.dueDate) ? 'filled' : 'outlined'}
                  />
                )}
                
                {/* Tags */}
                {todo.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
            
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Tarea</DialogTitle>
        <DialogContent>
          <TodoForm
            initialData={todo}
            onSubmit={() => setEditDialogOpen(false)}
            isEditing
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TodoItem;
