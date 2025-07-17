import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TodoForm from './TodoForm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddTodoFab = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Transition : undefined}
        PaperProps={{
          sx: {
            minHeight: isMobile ? '100vh' : '600px',
            maxHeight: isMobile ? '100vh' : '90vh',
          }
        }}
      >
        <DialogTitle>
          Agregar Nueva Tarea
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 2,
            pb: 3,
            minHeight: isMobile ? 'auto' : '500px',
          }}
        >
          <TodoForm onSubmit={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTodoFab;
