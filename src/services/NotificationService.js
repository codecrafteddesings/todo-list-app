class NotificationService {
  constructor() {
    this.permission = null;
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await this.requestPermission();
    }
  }

  async requestPermission() {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  scheduleNotification(todo) {
    if (!this.permission || !todo.dueDate) return;

    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();

    // Notificar 1 hora antes
    const oneHourBefore = timeDiff - (60 * 60 * 1000);
    
    if (oneHourBefore > 0) {
      setTimeout(() => {
        this.showNotification({
          title: 'Recordatorio de Tarea',
          body: `La tarea "${todo.title}" vence en 1 hora`,
          icon: '/logo192.png',
          tag: `reminder-${todo.id}`,
          data: { todoId: todo.id, type: 'reminder' }
        });
      }, oneHourBefore);
    }

    // Notificar en la fecha de vencimiento
    if (timeDiff > 0) {
      setTimeout(() => {
        this.showNotification({
          title: 'Tarea Vencida',
          body: `La tarea "${todo.title}" ha vencido`,
          icon: '/logo192.png',
          tag: `due-${todo.id}`,
          data: { todoId: todo.id, type: 'due' }
        });
      }, timeDiff);
    }
  }

  showNotification(options) {
    if (!this.permission) return;

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      data: options.data,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navegar a la tarea específica
      if (options.data?.todoId) {
        this.onNotificationClick?.(options.data.todoId);
      }
    };

    // Auto cerrar después de 10 segundos
    setTimeout(() => notification.close(), 10000);
  }

  cancelNotification(todoId) {
    // En un entorno real, usaríamos Service Workers para manejar esto
    console.log(`Cancelando notificaciones para tarea ${todoId}`);
  }

  setNotificationClickHandler(handler) {
    this.onNotificationClick = handler;
  }

  // Notificaciones de progreso diario
  showDailyProgress(stats) {
    if (!this.permission) return;

    this.showNotification({
      title: '¡Resumen del Día!',
      body: `Has completado ${stats.completed} de ${stats.total} tareas hoy. ¡Sigue así!`,
      icon: '/logo192.png',
      tag: 'daily-progress'
    });
  }

  // Notificación de logro
  showAchievement(message) {
    if (!this.permission) return;

    this.showNotification({
      title: '🎉 ¡Logro Desbloqueado!',
      body: message,
      icon: '/logo192.png',
      tag: 'achievement'
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
