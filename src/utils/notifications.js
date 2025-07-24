// notifications.js
// Utilidad para notificaciones locales en web/PWA

export function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

export function showNotification(title, options) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

// Programar notificación para una tarea
export function scheduleTaskNotification(todo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!todo.dueDate) return;

  // Calcular fecha/hora de vencimiento
  const dueDate = new Date(todo.dueDate);
  if (todo.dueTime) {
    const [h, m] = todo.dueTime.split(':');
    dueDate.setHours(h, m, 0, 0);
  }
  const now = new Date();
  const msUntilDue = dueDate - now;
  if (msUntilDue <= 0) return;

  setTimeout(() => {
    const fecha = dueDate.toLocaleDateString();
    const hora = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const prioridad = todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : '';
    const descripcion = todo.description ? `\nDescripción: ${todo.description}` : '';
    showNotification(todo.text, {
      body: `¡Recuerda! La tarea "${todo.text}" vence el ${fecha} a las ${hora}. Prioridad: ${prioridad}.${descripcion}`,
      icon: '/favicon.ico',
    });
  }, msUntilDue);
}
