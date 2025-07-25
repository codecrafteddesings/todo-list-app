
import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, useTheme, useMediaQuery, Slide } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TodoForm from './TodoForm';

const AddTodoFab = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpen}
        size="small"
        sx={{
          position: 'fixed',
          bottom: { xs: 14, sm: 16 },
          right: { xs: 14, sm: 16 },
          zIndex: 1000,
          boxShadow: 4,
          width: 34,
          height: 34,
          minHeight: 34,
          '& .MuiSvgIcon-root': {
            fontSize: 18,
          },
          '&:hover': {
            transform: 'scale(1.08)',
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
            minHeight: 'auto',
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
            backgroundColor: 'background.paper',
            borderRadius: 3,
            '@media (max-width:600px)': {
              px: 1.5,
              pt: 0.5,
              pb: 1.5,
            }
          }}
        >
          <TodoForm onSubmit={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTodoFab;
