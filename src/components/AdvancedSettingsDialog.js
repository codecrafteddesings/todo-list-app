import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import NotificationService from '../services/NotificationService';
import OfflineService from '../services/OfflineService';

const AdvancedSettingsDialog = ({ open, onClose }) => {
  const { state, dispatch } = useTodo();
  const [settings, setSettings] = useState({
    // Notificaciones
    enableNotifications: true,
    reminderTime: 60, // minutos antes
    dailyDigest: true,
    achievementNotifications: true,
    
    // Apariencia
    theme: 'light', // Se inicializará desde el contexto en useEffect
    fontSize: 'medium',
    compactView: false,
    showCompletedTasks: true,
    
    // Productividad
    pomodoroTime: 25, // minutos
    shortBreak: 5, // minutos
    longBreak: 15, // minutos
    autoArchiveCompleted: false,
    archiveAfterDays: 30,
    
    // Datos y backup
    autoBackup: true,
    backupFrequency: 'daily',
    cloudSync: false,
    
    // Personalización
    customCategories: [],
    defaultPriority: 'medium',
    defaultCategory: '',
    
    // Privacidad
    analyticsEnabled: true,
    crashReporting: true,
    
    // Offline
    offlineMode: true,
    cacheSize: 50 // MB
  });

  const [newCategory, setNewCategory] = useState('');
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    // Cargar configuraciones guardadas
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
    
    // Sincronizar tema desde el contexto
    if (state?.theme) {
      setSettings(prev => ({ ...prev, theme: state.theme }));
    }
    
    // Obtener información de almacenamiento
    getStorageInfo();
  }, [state?.theme]);

  const getStorageInfo = () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageInfo({
          used: estimate.usage,
          quota: estimate.quota,
          usedPercent: Math.round((estimate.usage / estimate.quota) * 100)
        });
      });
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Guardar en localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Aplicar configuraciones inmediatamente
    if (settings.theme !== (state?.theme || 'light')) {
      dispatch({ type: 'TOGGLE_THEME' });
    }
    
    // Configurar notificaciones
    if (settings.enableNotifications) {
      NotificationService.requestPermission();
    }
    
    // Mostrar confirmación
    alert('Configuraciones guardadas correctamente');
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !settings.customCategories.includes(newCategory.trim())) {
      handleSettingChange('customCategories', [...settings.customCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    handleSettingChange('customCategories', 
      settings.customCategories.filter(c => c !== category)
    );
  };

  const handleClearAllData = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      await OfflineService.deleteOffline('todos', null);
      dispatch({ type: 'CLEAR_ALL_TODOS' });
      alert('Todos los datos han sido eliminados');
      onClose();
    }
  };

  const handleExportSettings = () => {
    const exportData = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'configuraciones-tamblero.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.settings) {
            setSettings(importedData.settings);
            alert('Configuraciones importadas correctamente');
          }
        } catch (error) {
          alert('Error al importar configuraciones: archivo inválido');
        }
      };
      reader.readAsText(file);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>
            Configuración avanzada
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ height: 600, overflow: 'auto' }}>
        <Grid container spacing={3}>
          {/* Notificaciones */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon />
                  Notificaciones
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableNotifications}
                      onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                    />
                  }
                  label="Activar notificaciones"
                />
                
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    Recordar {settings.reminderTime} minutos antes
                  </Typography>
                  <Slider
                    value={settings.reminderTime}
                    onChange={(e, value) => handleSettingChange('reminderTime', value)}
                    min={5}
                    max={180}
                    step={5}
                    disabled={!settings.enableNotifications}
                    marks={[
                      { value: 15, label: '15m' },
                      { value: 60, label: '1h' },
                      { value: 120, label: '2h' }
                    ]}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.dailyDigest}
                      onChange={(e) => handleSettingChange('dailyDigest', e.target.checked)}
                      disabled={!settings.enableNotifications}
                    />
                  }
                  label="Resumen diario"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.achievementNotifications}
                      onChange={(e) => handleSettingChange('achievementNotifications', e.target.checked)}
                      disabled={!settings.enableNotifications}
                    />
                  }
                  label="Notificaciones de logros"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Apariencia */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaletteIcon />
                  Apariencia
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Tamaño de fuente</InputLabel>
                  <Select
                    value={settings.fontSize}
                    label="Tamaño de fuente"
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  >
                    <MenuItem value="small">Pequeña</MenuItem>
                    <MenuItem value="medium">Mediana</MenuItem>
                    <MenuItem value="large">Grande</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactView}
                      onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                    />
                  }
                  label="Vista compacta"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showCompletedTasks}
                      onChange={(e) => handleSettingChange('showCompletedTasks', e.target.checked)}
                    />
                  }
                  label="Mostrar tareas completadas"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Productividad */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⏱️ Productividad (Pomodoro)
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Tiempo de trabajo: {settings.pomodoroTime} minutos
                  </Typography>
                  <Slider
                    value={settings.pomodoroTime}
                    onChange={(e, value) => handleSettingChange('pomodoroTime', value)}
                    min={15}
                    max={60}
                    step={5}
                    marks={[
                      { value: 25, label: '25m' },
                      { value: 45, label: '45m' }
                    ]}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Descanso corto: {settings.shortBreak} minutos
                  </Typography>
                  <Slider
                    value={settings.shortBreak}
                    onChange={(e, value) => handleSettingChange('shortBreak', value)}
                    min={3}
                    max={15}
                    step={1}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoArchiveCompleted}
                      onChange={(e) => handleSettingChange('autoArchiveCompleted', e.target.checked)}
                    />
                  }
                  label={`Auto-archivar después de ${settings.archiveAfterDays} días`}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Categorías personalizadas */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📂 Categorías Personalizadas
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Nueva categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <IconButton onClick={handleAddCategory} color="primary">
                    <AddIcon />
                  </IconButton>
                </Box>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {settings.customCategories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      onDelete={() => handleRemoveCategory(category)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Categoría por defecto</InputLabel>
                  <Select
                    value={settings.defaultCategory}
                    label="Categoría por defecto"
                    onChange={(e) => handleSettingChange('defaultCategory', e.target.value)}
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    {settings.customCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Almacenamiento y datos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon />
                  Almacenamiento y Datos
                </Typography>
                
                {storageInfo && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Uso del almacenamiento: {formatBytes(storageInfo.used)} de {formatBytes(storageInfo.quota)} 
                      ({storageInfo.usedPercent}%)
                    </Typography>
                  </Alert>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<BackupIcon />}
                      onClick={handleExportSettings}
                    >
                      Exportar Configuración
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RestoreIcon />}
                      component="label"
                    >
                      Importar Configuración
                      <input
                        type="file"
                        accept=".json"
                        hidden
                        onChange={handleImportSettings}
                      />
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoBackup}
                          onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                        />
                      }
                      label="Backup automático"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearAllData}
                    >
                      Limpiar todos los datos
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacidad */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon />
                  Privacidad y Seguridad
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.analyticsEnabled}
                      onChange={(e) => handleSettingChange('analyticsEnabled', e.target.checked)}
                    />
                  }
                  label="Permitir análisis de uso"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.crashReporting}
                      onChange={(e) => handleSettingChange('crashReporting', e.target.checked)}
                    />
                  }
                  label="Reportar errores automáticamente"
                />
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Estos datos nos ayudan a mejorar la aplicación y nunca incluyen contenido personal.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Modo offline */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📱 Modo Offline
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.offlineMode}
                      onChange={(e) => handleSettingChange('offlineMode', e.target.checked)}
                    />
                  }
                  label="Activar modo offline"
                />
                
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    Tamaño de caché: {settings.cacheSize} MB
                  </Typography>
                  <Slider
                    value={settings.cacheSize}
                    onChange={(e, value) => handleSettingChange('cacheSize', value)}
                    min={10}
                    max={200}
                    step={10}
                    disabled={!settings.offlineMode}
                    marks={[
                      { value: 50, label: '50MB' },
                      { value: 100, label: '100MB' }
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSaveSettings} variant="contained">
          Guardar Configuración
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
