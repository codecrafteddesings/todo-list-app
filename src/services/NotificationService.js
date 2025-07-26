class NotificationService {
  // Reproduce un archivo de audio para notificaciones
  playNotificationSound() {
    try {
      const audio = new window.Audio('/notification.mp3');
      audio.volume = 0.7;
      audio.play();
    } catch (e) {
      console.warn('No se pudo reproducir el sonido de notificación:', e);
    }
  }
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
    console.log(`[NotificationService] Programando notificación para tarea '${todo.title}' (ID: ${todo.id})`);
    console.log(`[NotificationService] Ahora: ${now}, Vencimiento: ${dueDate}, Diferencia ms: ${timeDiff}`);
    if (oneHourBefore > 0) {
      console.log(`[NotificationService] Se programará recordatorio 1 hora antes en ${oneHourBefore / 1000} segundos`);
      setTimeout(() => {
        console.log(`[NotificationService] Mostrando notificación de recordatorio para tarea '${todo.title}'`);
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
      console.log(`[NotificationService] Se programará notificación de vencimiento en ${timeDiff / 1000} segundos`);
      setTimeout(() => {
        console.log(`[NotificationService] Mostrando notificación de vencimiento para tarea '${todo.title}'`);
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
    console.log(`[NotificationService] showNotification:`, options);
    this.playNotificationSound();
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
      // Si la tarea se marca como completada, cancelar repetición
      if (options.data?.todoId) {
        this.cancelNotification(options.data.todoId);
      }
    };

    // Auto cerrar después de 10 segundos
    setTimeout(() => notification.close(), 10000);

    // Repetir notificación cada minuto si no está completada
    if (options.data?.todoId && !options.data.completed) {
      if (!this._repeatIntervals) this._repeatIntervals = {};
      // Si ya existe un intervalo, no lo dupliques
      if (!this._repeatIntervals[options.data.todoId]) {
        this._repeatIntervals[options.data.todoId] = setInterval(() => {
          // Aquí podrías verificar si la tarea sigue pendiente antes de repetir
          this.playNotificationSound();
          new Notification(options.title, {
            body: options.body,
            icon: options.icon,
            tag: options.tag,
            data: options.data,
            requireInteraction: true
          });
        }, 60000); // cada 60 segundos
      }
    }
  }

  cancelNotification(todoId) {
    // Cancela la repetición automática de notificaciones
    if (this._repeatIntervals && this._repeatIntervals[todoId]) {
      clearInterval(this._repeatIntervals[todoId]);
      delete this._repeatIntervals[todoId];
      console.log(`Cancelando notificaciones repetidas para tarea ${todoId}`);
    }
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
