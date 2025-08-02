
import { offlineStorage } from './offlineStorage';
import { supabase } from '@/integrations/supabase/client';

class ConnectivityManager {
  private syncCallbacks: (() => void)[] = [];
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('Connection restored - triggering sync');
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost - switching to offline mode');
      this.isOnline = false;
    });
  }

  private startPeriodicSync() {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.triggerSync();
      }
    }, 30000);
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  async getUserPreferences() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('user_profile')
        .select('collect_sleep, collect_activity, collect_screen')
        .eq('id', user.id)
        .single();

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async storeSample(sample: {
    metric_type: string;
    metric_value: number;
    timestamp: string;
    user_id: string;
  }) {
    console.log(`Storing sample: ${sample.metric_type}`);
    
    // Check user preferences before storing
    const preferences = await this.getUserPreferences();
    if (preferences) {
      const shouldCollect = this.shouldCollectMetric(sample.metric_type, preferences);
      if (!shouldCollect) {
        console.log(`Data collection disabled for ${sample.metric_type}, skipping`);
        return;
      }
    }

    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('sensor_samples')
          .insert([sample]);

        if (error) {
          console.error('Error storing sample online:', error);
          // Fall back to offline storage
          await offlineStorage.cacheSample(sample);
        } else {
          console.log(`Sample stored online: ${sample.metric_type}`);
        }
      } catch (error) {
        console.error('Network error, storing offline:', error);
        await offlineStorage.cacheSample(sample);
      }
    } else {
      await offlineStorage.cacheSample(sample);
    }
  }

  private shouldCollectMetric(metricType: string, preferences: any): boolean {
    switch (metricType) {
      case 'sleep_hours':
      case 'sleep_quality':
        return preferences.collect_sleep ?? true;
      case 'steps':
      case 'activity_level':
        return preferences.collect_activity ?? true;
      case 'screen_time':
      case 'app_usage':
        return preferences.collect_screen ?? true;
      default:
        return true; // Collect unknown metrics by default
    }
  }

  async triggerSync() {
    if (!this.isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    try {
      console.log('Starting sync process');
      const unsyncedSamples = await offlineStorage.getUnsyncedSamples();
      
      if (unsyncedSamples.length === 0) {
        console.log('No unsynced samples found');
        return;
      }

      console.log(`Syncing ${unsyncedSamples.length} cached samples`);

      // Group samples by metric type for batch processing
      const samplesByType = unsyncedSamples.reduce((acc, sample) => {
        if (!acc[sample.metric_type]) {
          acc[sample.metric_type] = [];
        }
        acc[sample.metric_type].push(sample);
        return acc;
      }, {} as Record<string, typeof unsyncedSamples>);

      const syncedIds: string[] = [];

      // Process each metric type
      for (const [metricType, samples] of Object.entries(samplesByType)) {
        try {
          const { error } = await supabase
            .from('sensor_samples')
            .insert(samples.map(sample => ({
              user_id: sample.user_id,
              metric_type: sample.metric_type,
              metric_value: sample.metric_value,
              timestamp: sample.timestamp
            })));

          if (error) {
            console.error(`Error syncing ${metricType} samples:`, error);
          } else {
            console.log(`Successfully synced ${samples.length} ${metricType} samples`);
            syncedIds.push(...samples.map(s => s.id));
          }
        } catch (error) {
          console.error(`Network error syncing ${metricType}:`, error);
        }
      }

      // Mark successfully synced samples
      if (syncedIds.length > 0) {
        await offlineStorage.markAsSynced(syncedIds);
        console.log(`Marked ${syncedIds.length} samples as synced`);
      }

      // Clean up old synced samples periodically
      await offlineStorage.clearSyncedSamples();

      // Notify callbacks
      this.syncCallbacks.forEach(callback => callback());
      
    } catch (error) {
      console.error('Sync process failed:', error);
    }
  }

  onSync(callback: () => void) {
    this.syncCallbacks.push(callback);
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('online', this.triggerSync);
    window.removeEventListener('offline', () => {});
  }
}

export const connectivityManager = new ConnectivityManager();
