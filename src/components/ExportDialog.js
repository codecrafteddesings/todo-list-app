import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  LinearProgress,
  Alert,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Code as JsonIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import ExportService from '../services/ExportService';

const ExportDialog = ({ open, onClose }) => {
  const { todos } = useTodo();
  const [exportType, setExportType] = useState('pdf');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includePending, setIncludePending] = useState(true);
  const [groupBy, setGroupBy] = useState('none');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState(['high', 'medium', 'low']);

  // Obtener todas las categorías únicas
  const allCategories = [...new Set(todos.map(t => t.category).filter(Boolean))];

  // Filtrar todos según las opciones seleccionadas
  const getFilteredTodos = () => {
    return todos.filter(todo => {
      // Filtro por estado
      if (!includeCompleted && todo.completed) return false;
      if (!includePending && !todo.completed) return false;
      
      // Filtro por categoría
      if (selectedCategories.length > 0 && !selectedCategories.includes(todo.category)) return false;
      
      // Filtro por prioridad
      if (!selectedPriorities.includes(todo.priority)) return false;
      
      return true;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const filteredTodos = getFilteredTodos();
      
      if (filteredTodos.length === 0) {
        throw new Error('No hay tareas que coincidan con los filtros seleccionados');
      }

      // Simular progreso
      const updateProgress = (progress) => {
        setExportProgress(progress);
      };

      updateProgress(20);

      switch (exportType) {
        case 'pdf':
          await exportToPDF(filteredTodos, updateProgress);
          break;
        case 'csv':
          await exportToCSV(filteredTodos, updateProgress);
          break;
        case 'json':
          await exportToJSON(filteredTodos, updateProgress);
          break;
        case 'image':
          await exportToImage(updateProgress);
          break;
        default:
          throw new Error('Tipo de exportación no válido');
      }

      updateProgress(100);
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToPDF = async (filteredTodos, updateProgress) => {
    updateProgress(40);
    
    const options = {
      title: 'Lista de Tareas - TambleroKamba',
      includeCompleted,
      groupBy
    };
    
    updateProgress(70);
    const pdf = await ExportService.exportToPDF(filteredTodos, options);
    
    updateProgress(90);
    pdf.save(`tareas-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = async (filteredTodos, updateProgress) => {
    updateProgress(50);
    ExportService.exportToCSV(filteredTodos);
    updateProgress(100);
  };

  const exportToJSON = async (filteredTodos, updateProgress) => {
    updateProgress(50);
    
    const settings = {
      includeCompleted,
      includePending,
      groupBy,
      selectedCategories,
      selectedPriorities
    };
    
    ExportService.exportToJSON(filteredTodos, settings);
    updateProgress(100);
  };

  const exportToImage = async (updateProgress) => {
    updateProgress(30);
    
    try {
      const imageData = await ExportService.exportCurrentView('todo-list-container');
      updateProgress(80);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `tareas-captura-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      updateProgress(100);
    } catch (error) {
      throw new Error('No se pudo capturar la imagen. Asegúrate de que la lista de tareas esté visible.');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePriorityChange = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const getExportIcon = (type) => {
    const icons = {
      pdf: <PdfIcon />,
      csv: <CsvIcon />,
      json: <JsonIcon />,
      image: <ImageIcon />
    };
    return icons[type] || <DownloadIcon />;
  };

  const getFileDescription = (type) => {
    const descriptions = {
      pdf: 'Documento PDF con formato profesional',
      csv: 'Archivo CSV para Excel/Hojas de cálculo',
      json: 'Archivo JSON para backup/importación',
      image: 'Captura de pantalla de la vista actual'
    };
    return descriptions[type] || '';
  };

  const filteredTodos = getFilteredTodos();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DownloadIcon />
          Exportar Tareas
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Tipo de exportación */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Formato de Exportación</FormLabel>
          <RadioGroup
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <PdfIcon color="error" />
                  <Box>
                    <Typography variant="body1">PDF Profesional</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFileDescription('pdf')}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <CsvIcon color="success" />
                  <Box>
                    <Typography variant="body1">CSV (Excel)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFileDescription('csv')}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <JsonIcon color="info" />
                  <Box>
                    <Typography variant="body1">JSON (Backup)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFileDescription('json')}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="image"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <ImageIcon color="warning" />
                  <Box>
                    <Typography variant="body1">Imagen (PNG)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFileDescription('image')}
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Filtros de contenido */}
        <Typography variant="h6" gutterBottom>
          Filtros de Contenido
        </Typography>

        {/* Estado de las tareas */}
        <FormGroup sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeCompleted}
                onChange={(e) => setIncludeCompleted(e.target.checked)}
              />
            }
            label="Incluir tareas completadas"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includePending}
                onChange={(e) => setIncludePending(e.target.checked)}
              />
            }
            label="Incluir tareas pendientes"
          />
        </FormGroup>

        {/* Categorías */}
        {allCategories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Categorías a incluir:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {allCategories.map(category => (
                <Chip
                  key={category}
                  label={category}
                  clickable
                  color={selectedCategories.includes(category) ? 'primary' : 'default'}
                  variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                  onClick={() => handleCategoryChange(category)}
                />
              ))}
            </Stack>
            <Button
              size="small"
              onClick={() => setSelectedCategories(allCategories)}
              sx={{ mt: 1, mr: 1 }}
            >
              Seleccionar todas
            </Button>
            <Button
              size="small"
              onClick={() => setSelectedCategories([])}
              sx={{ mt: 1 }}
            >
              Limpiar selección
            </Button>
          </Box>
        )}

        {/* Prioridades */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Prioridades a incluir:
          </Typography>
          <Stack direction="row" spacing={1}>
            {[
              { value: 'high', label: 'Alta', color: 'error' },
              { value: 'medium', label: 'Media', color: 'warning' },
              { value: 'low', label: 'Baja', color: 'success' }
            ].map(priority => (
              <Chip
                key={priority.value}
                label={priority.label}
                clickable
                color={selectedPriorities.includes(priority.value) ? priority.color : 'default'}
                variant={selectedPriorities.includes(priority.value) ? 'filled' : 'outlined'}
                onClick={() => handlePriorityChange(priority.value)}
              />
            ))}
          </Stack>
        </Box>

        {/* Agrupación (solo para PDF) */}
        {exportType === 'pdf' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Agrupar por</InputLabel>
            <Select
              value={groupBy}
              label="Agrupar por"
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <MenuItem value="none">Sin agrupar</MenuItem>
              <MenuItem value="category">Categoría</MenuItem>
              <MenuItem value="priority">Prioridad</MenuItem>
              <MenuItem value="status">Estado</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Resumen */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Se exportarán <strong>{filteredTodos.length}</strong> tareas
            {filteredTodos.length !== todos.length && (
              <> de un total de <strong>{todos.length}</strong></>
            )}
          </Typography>
        </Alert>

        {/* Barra de progreso */}
        {isExporting && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Exportando...
            </Typography>
            <LinearProgress variant="determinate" value={exportProgress} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancelar
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting || filteredTodos.length === 0}
          startIcon={getExportIcon(exportType)}
        >
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
