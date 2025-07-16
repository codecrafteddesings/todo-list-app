import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Fade,
  Stack,
} from '@mui/material';

import { useTodo } from '../context/TodoContext';
import { useFilteredTodos } from '../hooks/useFilteredTodos';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';
import TodoStats from './TodoStats';

const TodoList = () => {
  const { filter, searchTerm, todos: allTodos } = useTodo();
  const { todos, stats } = useFilteredTodos();

  return (
    <Box>
      {/* Show stats only when we have todos and not searching */}
      {allTodos.length > 0 && !searchTerm && (
        <TodoStats />
      )}

      {/* Todo List */}
      {todos.length === 0 ? (
        <EmptyState filter={filter} searchTerm={searchTerm} />
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
              <Stack direction="row" spacing={3} justifyContent="space-around">
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
          </Stack>
        </>
      )}
    </Box>
  );
};

export default TodoList;
