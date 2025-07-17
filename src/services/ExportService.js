import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class ExportService {
  // Exportar a PDF con formato profesional
  async exportToPDF(todos, options = {}) {
    const {
      title = 'Lista de Tareas',
      includeCompleted = true,
      groupBy = 'none' // 'none', 'category', 'priority', 'status'
    } = options;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Configurar fuentes y colores
    pdf.setFontSize(20);
    pdf.setTextColor(33, 150, 243); // Color azul
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Filtrar todos según opciones
    let filteredTodos = includeCompleted ? todos : todos.filter(t => !t.completed);
    
    // Agrupar todos
    const groupedTodos = this.groupTodos(filteredTodos, groupBy);

    for (const [groupName, groupTodos] of Object.entries(groupedTodos)) {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      // Título del grupo (si aplica)
      if (groupBy !== 'none') {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(this.getGroupTitle(groupName, groupBy), 20, yPosition);
        yPosition += 10;
        
        // Línea separadora
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;
      }

      // Listar tareas del grupo
      pdf.setFontSize(10);
      for (const todo of groupTodos) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        // Checkbox
        const checkboxSize = 4;
        pdf.setDrawColor(100, 100, 100);
        pdf.rect(20, yPosition - 3, checkboxSize, checkboxSize);
        
        if (todo.completed) {
          pdf.setTextColor(0, 150, 0);
          pdf.text('✓', 21, yPosition);
        }

        // Título de la tarea
        pdf.setTextColor(todo.completed ? 128 : 0, todo.completed ? 128 : 0, todo.completed ? 128 : 0);
        const titleLines = pdf.splitTextToSize(todo.title, pageWidth - 60);
        pdf.text(titleLines, 30, yPosition);
        
        yPosition += titleLines.length * 5;

        // Descripción (si existe)
        if (todo.description) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          const descLines = pdf.splitTextToSize(todo.description, pageWidth - 60);
          pdf.text(descLines, 30, yPosition);
          yPosition += descLines.length * 4;
        }

        // Metadata (fecha, prioridad, categoría)
        const metadata = [];
        if (todo.dueDate) metadata.push(`Vence: ${new Date(todo.dueDate).toLocaleDateString('es-ES')}`);
        if (todo.priority) metadata.push(`Prioridad: ${this.translatePriority(todo.priority)}`);
        if (todo.category) metadata.push(`Categoría: ${todo.category}`);

        if (metadata.length > 0) {
          pdf.setFontSize(7);
          pdf.setTextColor(150, 150, 150);
          pdf.text(metadata.join(' | '), 30, yPosition);
          yPosition += 8;
        }

        yPosition += 5; // Espacio entre tareas
      }

      yPosition += 10; // Espacio entre grupos
    }

    // Estadísticas al final
    this.addStatisticsPage(pdf, todos);

    return pdf;
  }

  // Exportar vista actual como imagen
  async exportCurrentView(elementId) {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Elemento no encontrado');

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    });

    return canvas.toDataURL('image/png');
  }

  // Exportar a CSV
  exportToCSV(todos) {
    const headers = ['Título', 'Descripción', 'Categoría', 'Prioridad', 'Fecha Vencimiento', 'Completada', 'Fecha Creación'];
    const csvContent = [
      headers.join(','),
      ...todos.map(todo => [
        `"${todo.title.replace(/"/g, '""')}"`,
        `"${(todo.description || '').replace(/"/g, '""')}"`,
        todo.category,
        todo.priority,
        todo.dueDate || '',
        todo.completed ? 'Sí' : 'No',
        todo.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, 'tareas.csv');
  }

  // Exportar a JSON (para backup)
  exportToJSON(todos, settings = {}) {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      todos,
      settings,
      totalTasks: todos.length,
      completedTasks: todos.filter(t => t.completed).length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, 'backup-tareas.json');
  }

  // Generar archivo de ejemplo para importación
  generateSampleJSON() {
    const sampleData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      todos: [
        {
          id: 'sample-1',
          title: 'Tarea de ejemplo 1',
          description: 'Esta es una descripción de ejemplo para mostrar el formato',
          category: 'trabajo',
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          tags: ['ejemplo', 'importante'],
          workTime: 0,
          pomodoroSessions: []
        },
        {
          id: 'sample-2',
          title: 'Tarea completada de ejemplo',
          description: 'Ejemplo de tarea ya completada',
          category: 'personal',
          priority: 'medium',
          dueDate: null,
          completed: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          tags: ['ejemplo'],
          workTime: 1800, // 30 minutos
          pomodoroSessions: [
            {
              startTime: new Date(Date.now() - 86400000).toISOString(),
              duration: 1500, // 25 minutos
              completed: true
            }
          ]
        }
      ],
      settings: {
        theme: 'light',
        notifications: true,
        pomodoroTime: 25
      },
      totalTasks: 2,
      completedTasks: 1
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, 'ejemplo-backup-tareas.json');
  }

  // Generar CSV de ejemplo
  generateSampleCSV() {
    const sampleCSV = [
      'Título,Descripción,Categoría,Prioridad,Fecha Vencimiento,Completada,Fecha Creación',
      '"Revisar documentos","Revisar y aprobar documentos del proyecto","trabajo","alta","2025-07-17","No","2025-07-16"',
      '"Comprar víveres","Lista de compras para la semana","personal","media","","No","2025-07-15"',
      '"Ejercicio matutino","Rutina de ejercicios de 30 minutos","salud","baja","2025-07-16","Sí","2025-07-14"',
      '"Llamar al cliente","Seguimiento del proyecto ABC","trabajo","alta","2025-07-18","No","2025-07-16"'
    ].join('\n');

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, 'ejemplo-tareas.csv');
  }

  // Métodos auxiliares
  groupTodos(todos, groupBy) {
    if (groupBy === 'none') {
      return { 'Todas las tareas': todos };
    }

    return todos.reduce((groups, todo) => {
      let key;
      switch (groupBy) {
        case 'category':
          key = todo.category || 'Sin categoría';
          break;
        case 'priority':
          key = this.translatePriority(todo.priority) || 'Sin prioridad';
          break;
        case 'status':
          key = todo.completed ? 'Completadas' : 'Pendientes';
          break;
        default:
          key = 'Todas';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(todo);
      return groups;
    }, {});
  }

  getGroupTitle(groupName, groupBy) {
    const titles = {
      category: `📂 ${groupName}`,
      priority: `⚡ ${groupName}`,
      status: `📋 ${groupName}`,
      none: groupName
    };
    return titles[groupBy] || groupName;
  }

  translatePriority(priority) {
    const translations = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return translations[priority] || priority;
  }

  addStatisticsPage(pdf, todos) {
    pdf.addPage();
    let yPos = 30;

    // Título de estadísticas
    pdf.setFontSize(16);
    pdf.setTextColor(33, 150, 243);
    pdf.text('Estadísticas', 20, yPos);
    yPos += 20;

    // Estadísticas generales
    const stats = this.calculateStats(todos);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    const statsText = [
      `Total de tareas: ${stats.total}`,
      `Tareas completadas: ${stats.completed}`,
      `Tareas pendientes: ${stats.pending}`,
      `Porcentaje de finalización: ${stats.completionRate}%`,
      `Tareas vencidas: ${stats.overdue}`,
      `Tareas para hoy: ${stats.dueToday}`
    ];

    statsText.forEach(text => {
      pdf.text(text, 20, yPos);
      yPos += 8;
    });
  }

  calculateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const now = new Date();
    const today = now.toDateString();
    
    const overdue = todos.filter(t => 
      !t.completed && t.dueDate && new Date(t.dueDate) < now
    ).length;
    
    const dueToday = todos.filter(t => 
      !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === today
    ).length;

    return { total, completed, pending, completionRate, overdue, dueToday };
  }

  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

const exportService = new ExportService();
export default exportService;
