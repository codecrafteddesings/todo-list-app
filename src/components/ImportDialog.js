import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Backup as BackupIcon,
  TableChart as CsvIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import ImportService from '../services/ImportService';
import ExportService from '../services/ExportService';

const ImportDialog = ({ open, onClose }) => {
  const { dispatch } = useTodo();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importOptions, setImportOptions] = useState({
    mergeStrategy: 'add', // 'add', 'replace', 'skip'
    importSettings: true,
    createBackup: true
  });

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      handleImport(files[0]);
    }
  };

  const handleImport = async (file) => {
    try {
      setImporting(true);
      setImportResult(null);

      // Validar archivo
      ImportService.validateFile(file);

      // Crear backup antes de importar si está habilitado
      if (importOptions.createBackup) {
        // Implementar backup automático aquí si es necesario
      }

      // Importar según el tipo de archivo
      let result;
      const extension = file.name.split('.').pop().toLowerCase();

      if (extension === 'json') {
        result = await ImportService.importFromJSON(file, dispatch);
      } else if (extension === 'csv') {
        result = await ImportService.importFromCSV(file, dispatch);
      } else {
        throw new Error('Tipo de archivo no soportado');
      }

      setImportResult({
        success: true,
        ...result
      });

    } catch (error) {
      setImportResult({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleClose = () => {
    setImportResult(null);
    setImporting(false);
    onClose();
  };

  const getResultIcon = () => {
    if (!importResult) return null;
    
    if (importResult.success) {
      return <SuccessIcon color="success" />;
    } else {
      return <ErrorIcon color="error" />;
    }
  };

  const getResultColor = () => {
    if (!importResult) return 'info';
    return importResult.success ? 'success' : 'error';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <UploadIcon />
          Importar Datos
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Información sobre formatos soportados */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Formatos soportados
            </Typography>
            <Stack spacing={1}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BackupIcon color="primary" />
                  <Box flex={1}>
                    <Typography variant="subtitle2">
                      Archivo JSON (Recomendado)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Backup completo con tareas, configuraciones y metadatos
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip label=".json" color="primary" variant="outlined" />
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => ExportService.generateSampleJSON()}
                    >
                      Ejemplo
                    </Button>
                  </Box>
                </Box>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <CsvIcon color="secondary" />
                  <Box flex={1}>
                    <Typography variant="subtitle2">
                      Archivo CSV
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Solo tareas en formato tabla (Excel compatible)
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip label=".csv" color="secondary" variant="outlined" />
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => ExportService.generateSampleCSV()}
                    >
                      Ejemplo
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Box>

          <Divider />

          {/* Opciones de importación */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Opciones de importación
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Estrategia al encontrar tareas duplicadas</FormLabel>
              <RadioGroup
                value={importOptions.mergeStrategy}
                onChange={(e) => setImportOptions(prev => ({ ...prev, mergeStrategy: e.target.value }))}
              >
                <FormControlLabel 
                  value="add" 
                  control={<Radio />} 
                  label="Agregar todas (pueden crearse duplicados)" 
                />
                <FormControlLabel 
                  value="skip" 
                  control={<Radio />} 
                  label="Omitir duplicados (mantener existentes)" 
                />
                <FormControlLabel 
                  value="replace" 
                  control={<Radio />} 
                  label="Reemplazar duplicados (actualizar existentes)" 
                />
              </RadioGroup>
            </FormControl>

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={importOptions.importSettings}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, importSettings: e.target.checked }))}
                  />
                }
                label="Importar configuraciones (si están disponibles)"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={importOptions.createBackup}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, createBackup: e.target.checked }))}
                  />
                }
                label="Crear backup automático antes de importar"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Zona de carga */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Seleccionar archivo
            </Typography>
            
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                borderStyle: dragOver ? 'solid' : 'dashed',
                borderColor: dragOver ? 'primary.main' : 'grey.300',
                backgroundColor: dragOver ? 'primary.50' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              
              <Stack spacing={2} alignItems="center">
                <UploadIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: dragOver ? 'primary.main' : 'grey.400'
                  }} 
                />
                
                <Box>
                  <Typography variant="h6" color={dragOver ? 'primary.main' : 'text.primary'}>
                    {dragOver ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    o haz clic para seleccionar
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Formatos soportados: JSON, CSV (máx. 10MB)
                </Typography>
              </Stack>
            </Paper>
          </Box>

          {/* Progreso de importación */}
          {importing && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Importando archivo...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {/* Resultado de importación */}
          {importResult && (
            <Alert 
              severity={getResultColor()} 
              icon={getResultIcon()}
              sx={{ '& .MuiAlert-message': { width: '100%' } }}
            >
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {importResult.success ? 'Importación exitosa' : 'Error en importación'}
                </Typography>
                
                <Typography variant="body2">
                  {importResult.message || importResult.error}
                </Typography>
                
                {importResult.success && (
                  <Box mt={1}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {importResult.imported > 0 && (
                        <Chip 
                          size="small" 
                          icon={<SuccessIcon />}
                          label={`${importResult.imported} importadas`}
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {importResult.skipped > 0 && (
                        <Chip 
                          size="small" 
                          icon={<WarningIcon />}
                          label={`${importResult.skipped} omitidas`}
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      {importResult.settings && (
                        <Chip 
                          size="small" 
                          icon={<InfoIcon />}
                          label="Configuraciones importadas"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {importResult?.success ? 'Finalizar' : 'Cancelar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
