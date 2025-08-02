
interface CachedSample {
  id: string;
  metric_type: string;
  metric_value: number;
  timestamp: string;
  user_id: string;
  synced: boolean;
  created_at: string;
}

class OfflineStorage {
  private dbName = 'sensor_samples_cache';
  private version = 1;
  private storeName = 'samples';

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async cacheSample(sample: Omit<CachedSample, 'id' | 'synced' | 'created_at'>): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const cachedSample: CachedSample = {
        ...sample,
        id: crypto.randomUUID(),
        synced: false,
        created_at: new Date().toISOString()
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.add(cachedSample);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log(`Cached sample offline: ${sample.metric_type}`);
    } catch (error) {
      console.error('Error caching sample:', error);
    }
  }

  async getUnsyncedSamples(): Promise<CachedSample[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('synced');
      
      return new Promise((resolve, reject) => {
        // Use IDBKeyRange.only() to create proper key range for boolean false
        const request = index.getAll(IDBKeyRange.only(false));
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
          console.error('Error getting unsynced samples:', request.error);
          resolve([]); // Return empty array instead of rejecting to prevent sync failures
        };
      });
    } catch (error) {
      console.error('Error in getUnsyncedSamples:', error);
      return []; // Return empty array on error
    }
  }

  async markAsSynced(sampleIds: string[]): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      for (const id of sampleIds) {
        try {
          const getRequest = store.get(id);
          await new Promise<void>((resolve, reject) => {
            getRequest.onsuccess = () => {
              const sample = getRequest.result;
              if (sample) {
                sample.synced = true;
                const putRequest = store.put(sample);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
              } else {
                resolve();
              }
            };
            getRequest.onerror = () => reject(getRequest.error);
          });
        } catch (error) {
          console.error(`Error marking sample ${id} as synced:`, error);
          // Continue with other samples even if one fails
        }
      }
    } catch (error) {
      console.error('Error in markAsSynced:', error);
    }
  }

  async clearSyncedSamples(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('synced');
      
      // Use IDBKeyRange.only() to create proper key range for boolean true
      const request = index.openCursor(IDBKeyRange.only(true));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      request.onerror = (error) => {
        console.error('Error clearing synced samples:', error);
      };
    } catch (error) {
      console.error('Error in clearSyncedSamples:', error);
    }
  }
}

export const offlineStorage = new OfflineStorage();
