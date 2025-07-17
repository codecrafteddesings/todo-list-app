class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.lastSync = localStorage.getItem('lastSync') || null;
    this.setupEventListeners();
    this.initDB();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async initDB() {
    if ('indexedDB' in window) {
      this.db = await this.openDB();
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TodoAppDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store para todos
        if (!db.objectStoreNames.contains('todos')) {
          const todoStore = db.createObjectStore('todos', { keyPath: 'id' });
          todoStore.createIndex('category', 'category', { unique: false });
          todoStore.createIndex('priority', 'priority', { unique: false });
          todoStore.createIndex('completed', 'completed', { unique: false });
        }
        
        // Store para configuraciones
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        // Store para caché de archivos
        if (!db.objectStoreNames.contains('attachments')) {
          db.createObjectStore('attachments', { keyPath: 'id' });
        }
      };
    });
  }

  // Guardar datos offline
  async saveOffline(storeName, data) {
    if (!this.db) return false;
    
    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (Array.isArray(data)) {
        for (const item of data) {
          await store.put(item);
        }
      } else {
        await store.put(data);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving offline:', error);
      return false;
    }
  }

  // Cargar datos offline
  async loadOffline(storeName, key = null) {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (key) {
        return await this.promisifyRequest(store.get(key));
      } else {
        return await this.promisifyRequest(store.getAll());
      }
    } catch (error) {
      console.error('Error loading offline:', error);
      return null;
    }
  }

  // Eliminar datos offline
  async deleteOffline(storeName, key) {
    if (!this.db) return false;
    
    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await this.promisifyRequest(store.delete(key));
      return true;
    } catch (error) {
      console.error('Error deleting offline:', error);
      return false;
    }
  }

  // Cola de sincronización
  addToSyncQueue(operation) {
    const syncItem = {
      id: Date.now() + Math.random(),
      operation,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    this.syncQueue.push(syncItem);
    this.saveSyncQueue();
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of itemsToProcess) {
      try {
        await this.processSyncItem(item);
      } catch (error) {
        console.error('Error processing sync item:', error);
        
        // Reintentamos hasta 3 veces
        if (item.retries < 3) {
          item.retries++;
          this.syncQueue.push(item);
        }
      }
    }
    
    this.saveSyncQueue();
    this.updateLastSync();
  }

  async processSyncItem(item) {
    const { operation } = item;
    
    switch (operation.type) {
      case 'CREATE_TODO':
        // Simular API call
        await this.simulateAPICall('POST', '/todos', operation.data);
        break;
      case 'UPDATE_TODO':
        await this.simulateAPICall('PUT', `/todos/${operation.id}`, operation.data);
        break;
      case 'DELETE_TODO':
        await this.simulateAPICall('DELETE', `/todos/${operation.id}`);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  async simulateAPICall(method, endpoint, data = null) {
    // Simular llamada a API real
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`API Call: ${method} ${endpoint}`, data);
        resolve({ success: true });
      }, 1000);
    });
  }

  // Sincronización bidireccional
  async syncWhenOnline() {
    if (!this.isOnline) return;
    
    try {
      // Procesar cola de sincronización
      await this.processSyncQueue();
      
      // Sincronizar desde servidor (simulado)
      await this.pullFromServer();
      
      this.updateLastSync();
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  async pullFromServer() {
    // Simular descarga de datos del servidor
    console.log('Pulling data from server...');
    
    // En una app real, aquí haríamos:
    // const serverData = await fetch('/api/todos').then(r => r.json());
    // await this.saveOffline('todos', serverData);
  }

  // Detección de conflictos
  detectConflicts(localData, serverData) {
    const conflicts = [];
    
    localData.forEach(localItem => {
      const serverItem = serverData.find(s => s.id === localItem.id);
      if (serverItem && new Date(serverItem.updatedAt) > new Date(localItem.updatedAt)) {
        conflicts.push({
          id: localItem.id,
          local: localItem,
          server: serverItem
        });
      }
    });
    
    return conflicts;
  }

  // Resolución automática de conflictos
  resolveConflicts(conflicts, strategy = 'server-wins') {
    return conflicts.map(conflict => {
      switch (strategy) {
        case 'server-wins':
          return conflict.server;
        case 'client-wins':
          return conflict.local;
        case 'merge':
          return this.mergeConflict(conflict.local, conflict.server);
        default:
          return conflict.server;
      }
    });
  }

  mergeConflict(local, server) {
    // Estrategia de merge simple: mantener campos más recientes
    return {
      ...server,
      title: local.updatedAt > server.updatedAt ? local.title : server.title,
      description: local.updatedAt > server.updatedAt ? local.description : server.description,
      completed: server.completed, // El estado de completado siempre desde servidor
      updatedAt: new Date().toISOString()
    };
  }

  // Caché inteligente
  async cacheResource(url, data) {
    const cacheItem = {
      id: btoa(url), // Base64 encode URL as ID
      url,
      data,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
    
    await this.saveOffline('attachments', cacheItem);
  }

  async getCachedResource(url) {
    const cacheItem = await this.loadOffline('attachments', btoa(url));
    
    if (!cacheItem) return null;
    
    // Verificar expiración
    if (new Date() > new Date(cacheItem.expiresAt)) {
      await this.deleteOffline('attachments', btoa(url));
      return null;
    }
    
    return cacheItem.data;
  }

  // Utilidades
  saveSyncQueue() {
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  loadSyncQueue() {
    const saved = localStorage.getItem('syncQueue');
    if (saved) {
      this.syncQueue = JSON.parse(saved);
    }
  }

  updateLastSync() {
    this.lastSync = new Date().toISOString();
    localStorage.setItem('lastSync', this.lastSync);
  }

  promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Estado de conectividad
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingSync: this.syncQueue.length,
      hasOfflineData: this.db !== null
    };
  }

  // Limpiar datos antiguos
  async clearExpiredCache() {
    if (!this.db) return;
    
    const allCached = await this.loadOffline('attachments');
    const now = new Date();
    
    for (const item of allCached || []) {
      if (new Date(item.expiresAt) < now) {
        await this.deleteOffline('attachments', item.id);
      }
    }
  }
}

const offlineService = new OfflineService();
export default offlineService;
