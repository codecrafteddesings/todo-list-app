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
            '@media (max-width:600px)': {
              px: 1.5,
              pt: 0.5,
              pb: 1.5,
            },
          }}
        >
          <TodoForm onSubmit={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTodoFab;
