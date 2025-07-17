class ImportService {
  // Importar desde archivo JSON
  async importFromJSON(file, dispatch) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validar formato del archivo
          if (!this.validateImportData(data)) {
            reject(new Error('Formato de archivo inválido'));
            return;
          }
          
          // Procesar importación según el tipo de datos
          const result = this.processImportData(data, dispatch);
          resolve(result);
          
        } catch (error) {
          reject(new Error('Error al leer el archivo: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  }

  // Importar desde CSV
  async importFromCSV(file, dispatch) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target.result;
          const todos = this.parseCSV(csvData);
          
          if (todos.length === 0) {
            reject(new Error('No se encontraron tareas válidas en el archivo'));
            return;
          }
          
          // Importar tareas
          todos.forEach(todo => {
            dispatch({ type: 'ADD_TODO', payload: todo });
          });
          
          resolve({
            type: 'csv',
            imported: todos.length,
            skipped: 0,
            message: `Se importaron ${todos.length} tareas desde CSV`
          });
          
        } catch (error) {
          reject(new Error('Error al procesar CSV: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo CSV'));
      };
      
      reader.readAsText(file);
    });
  }

  // Validar datos de importación
  validateImportData(data) {
    // Verificar si es un backup completo
    if (data.version && data.todos && Array.isArray(data.todos)) {
      return true;
    }
    
    // Verificar si es solo un array de todos
    if (Array.isArray(data) && data.every(item => item.title || item.text)) {
      return true;
    }
    
    // Verificar si es configuración
    if (data.settings || data.theme) {
      return true;
    }
    
    return false;
  }

  // Procesar datos de importación
  processImportData(data, dispatch) {
    let importedTodos = 0;
    let importedSettings = false;
    let skipped = 0;
    
    // Backup completo
    if (data.version && data.todos) {
      data.todos.forEach(todo => {
        if (this.validateTodo(todo)) {
          dispatch({ type: 'ADD_TODO', payload: this.sanitizeTodo(todo) });
          importedTodos++;
        } else {
          skipped++;
        }
      });
      
      // Importar configuraciones si existen
      if (data.settings) {
        this.importSettings(data.settings);
        importedSettings = true;
      }
      
      return {
        type: 'backup',
        imported: importedTodos,
        skipped,
        settings: importedSettings,
        message: `Backup importado: ${importedTodos} tareas${importedSettings ? ' y configuraciones' : ''}`
      };
    }
    
    // Array de todos
    if (Array.isArray(data)) {
      data.forEach(todo => {
        if (this.validateTodo(todo)) {
          dispatch({ type: 'ADD_TODO', payload: this.sanitizeTodo(todo) });
          importedTodos++;
        } else {
          skipped++;
        }
      });
      
      return {
        type: 'todos',
        imported: importedTodos,
        skipped,
        message: `Se importaron ${importedTodos} tareas`
      };
    }
    
    // Solo configuraciones
    if (data.settings || data.theme) {
      this.importSettings(data);
      return {
        type: 'settings',
        imported: 0,
        skipped: 0,
        settings: true,
        message: 'Configuraciones importadas correctamente'
      };
    }
    
    throw new Error('Formato de datos no reconocido');
  }

  // Validar estructura de una tarea
  validateTodo(todo) {
    return todo && (todo.title || todo.text) && typeof todo === 'object';
  }

  // Limpiar y normalizar una tarea
  sanitizeTodo(todo) {
    const now = new Date().toISOString();
    
    return {
      id: todo.id || this.generateId(),
      title: todo.title || todo.text || 'Tarea sin título',
      text: todo.text || todo.title || 'Tarea sin título',
      description: todo.description || '',
      category: todo.category || 'personal',
      priority: ['high', 'medium', 'low'].includes(todo.priority) ? todo.priority : 'medium',
      dueDate: todo.dueDate || null,
      completed: Boolean(todo.completed),
      createdAt: todo.createdAt || now,
      updatedAt: todo.updatedAt || now,
      completedAt: todo.completedAt || null,
      tags: Array.isArray(todo.tags) ? todo.tags : [],
      workTime: Number(todo.workTime) || 0,
      pomodoroSessions: Array.isArray(todo.pomodoroSessions) ? todo.pomodoroSessions : []
    };
  }

  // Importar configuraciones
  importSettings(settings) {
    try {
      // Guardar en localStorage
      const currentSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
      const mergedSettings = { ...currentSettings, ...settings };
      localStorage.setItem('appSettings', JSON.stringify(mergedSettings));
      
      // Notificar que se reinicie la aplicación para aplicar cambios
      if (settings.theme) {
        localStorage.setItem('importedTheme', settings.theme);
      }
      
      return true;
    } catch (error) {
      console.error('Error al importar configuraciones:', error);
      return false;
    }
  }

  // Parsear CSV
  parseCSV(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const todos = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const todo = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, '').trim();
          
          switch (header.toLowerCase()) {
            case 'título':
            case 'title':
              todo.title = value;
              break;
            case 'descripción':
            case 'description':
              todo.description = value;
              break;
            case 'categoría':
            case 'category':
              todo.category = value;
              break;
            case 'prioridad':
            case 'priority':
              todo.priority = this.translatePriorityFromSpanish(value);
              break;
            case 'fecha vencimiento':
            case 'due date':
              todo.dueDate = value && value !== '' ? value : null;
              break;
            case 'completada':
            case 'completed':
              todo.completed = value.toLowerCase() === 'sí' || value.toLowerCase() === 'yes' || value === 'true';
              break;
            case 'fecha creación':
            case 'created':
              todo.createdAt = value;
              break;
            default:
              // Campo no reconocido, ignorar
              break;
          }
        });
        
        if (todo.title) {
          todos.push(this.sanitizeTodo(todo));
        }
      }
    }
    
    return todos;
  }

  // Parsear línea CSV manejando comillas
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // Traducir prioridad del español
  translatePriorityFromSpanish(priority) {
    const translations = {
      'alta': 'high',
      'media': 'medium',
      'baja': 'low',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    return translations[priority?.toLowerCase()] || 'medium';
  }

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Obtener tipos de archivo soportados
  getSupportedFileTypes() {
    return {
      json: {
        accept: '.json',
        description: 'Archivos JSON (backup completo)',
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      csv: {
        accept: '.csv',
        description: 'Archivos CSV (solo tareas)',
        maxSize: 5 * 1024 * 1024 // 5MB
      }
    };
  }

  // Validar archivo antes de importar
  validateFile(file) {
    const fileTypes = this.getSupportedFileTypes();
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    // Verificar extensión
    const supportedExtensions = Object.values(fileTypes).map(type => type.accept);
    if (!supportedExtensions.includes(extension)) {
      throw new Error(`Tipo de archivo no soportado. Use: ${supportedExtensions.join(', ')}`);
    }
    
    // Verificar tamaño
    const fileType = extension === '.json' ? fileTypes.json : fileTypes.csv;
    if (file.size > fileType.maxSize) {
      throw new Error(`El archivo es demasiado grande. Máximo: ${Math.round(fileType.maxSize / 1024 / 1024)}MB`);
    }
    
    return true;
  }
}

const importService = new ImportService();
export default importService;
