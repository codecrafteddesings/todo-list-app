import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Fade,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

import { useTodo } from '../context/TodoContext';
import { useFilteredTodos } from '../hooks/useFilteredTodos';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';
import TodoStats from './TodoStats';
import TodoForm from './TodoForm';

const TodoList = () => {
  const { filter, searchTerm, todos: allTodos } = useTodo();
  const { todos, stats } = useFilteredTodos();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddTask = () => {
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  return (
    <Box>
      {/* Show stats only when we have todos and not searching */}
      {allTodos.length > 0 && !searchTerm && (
        <TodoStats />
      )}

      {/* Todo List */}
      {todos.length === 0 ? (
        <EmptyState 
          filter={filter} 
          searchTerm={searchTerm} 
          onAddTask={handleAddTask}
        />
      ) : (
        <>
          {/* Stats Summary - when filtering/searching */}
          {(filter !== 'all' || searchTerm) && (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="space-around"
                sx={{
                  flexWrap: { xs: 'nowrap', sm: 'wrap' },
                  overflowX: { xs: 'auto', sm: 'visible' },
                  WebkitOverflowScrolling: 'touch',
                  minWidth: 0,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {todos.length}
                  </Typography>
                  <Typography variant="body2">
                    Resultados
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {stats.active}
                  </Typography>
                  <Typography variant="body2">
                    Pendientes
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2">
                    Completadas
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {stats.completionRate}%
                  </Typography>
                  <Typography variant="body2">
                    Progreso
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          <Stack spacing={2}>
            {todos.map((todo, index) => (
              <Fade
                key={todo.id}
                in={true}
                timeout={300}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div>
                  <TodoItem todo={todo} />
                </div>
              </Fade>
            ))}
            
            {/* Botón para agregar nueva tarea */}
            <Fade in={true} timeout={300} style={{ transitionDelay: `${todos.length * 50 + 100}ms` }}>
              <Card
                sx={{
                  mt: 3,
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  backgroundColor: 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={handleAddTask}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    px: 3,
                    '&:last-child': { pb: 4 }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <AddIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mb: 0.5
                        }}
                      >
                        Agregar nueva tarea
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
                        Organiza tu día creando una nueva tarea
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Stack>
        </>
      )}

      {/* Add Task Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: 8,
            maxWidth: 340,
            m: 'auto',
            p: 0,
            background: 'background.paper',
            border: '1.5px solid',
            borderColor: 'grey.200',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.3rem' },
          px: { xs: 2, sm: 3 },
          pt: 2,
          pb: 1,
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          background: 'background.paper',
        }}>
          Agregar Nueva Tarea
        </DialogTitle>
        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            pt: 1,
            pb: 2,
            minWidth: 'auto',
            minHeight: 'auto',
            background: 'background.paper',
            borderRadius: 3,
            // Compactar en móvil
            '@media (max-width:600px)': {
              px: 1.5,
              pt: 0.5,
              pb: 1.5,
            },
          }}
        >
          <TodoForm onSubmit={handleCloseAddDialog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TodoList;
