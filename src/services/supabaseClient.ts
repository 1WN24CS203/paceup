import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from '../types/activity';
import { UserProfile } from '../types/user';

const SUPABASE_CONFIG_KEY = '@paceup_supabase_config_store';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

export class SupabaseManager {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    isEnabled: false,
  };

  async init(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
        if (this.config.isEnabled && this.config.url && this.config.anonKey) {
          this.client = createClient(this.config.url, this.config.anonKey);
        }
      }
    } catch (e) {
      console.warn('SupabaseManager init error:', e);
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  getConfig(): SupabaseConfig {
    return this.config;
  }

  async saveConfig(url: string, anonKey: string, isEnabled: boolean): Promise<boolean> {
    try {
      this.config = { url: url.trim(), anonKey: anonKey.trim(), isEnabled };
      await AsyncStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(this.config));

      if (isEnabled && url.trim() && anonKey.trim()) {
        this.client = createClient(url.trim(), anonKey.trim());
        return true;
      } else {
        this.client = null;
        return true;
      }
    } catch (e) {
      console.warn('Failed to save Supabase config:', e);
      return false;
    }
  }

  isCloudConnected(): boolean {
    return this.client !== null && this.config.isEnabled;
  }

  /**
   * Syncs an activity to Supabase cloud database if connected.
   */
  async syncActivity(activity: Activity, user: UserProfile): Promise<boolean> {
    if (!this.client || !this.config.isEnabled) {
      return false;
    }

    try {
      const { error } = await this.client.from('activities').insert({
        id: activity.id,
        user_id: user.id,
        title: activity.title,
        activity_type: activity.activityType,
        start_time: new Date(activity.startTime).toISOString(),
        end_time: new Date(activity.endTime).toISOString(),
        duration_sec: activity.durationSec,
        distance_km: activity.distanceKm,
        avg_pace_sec_per_km: activity.avgPaceSecPerKm,
        best_pace_sec_per_km: activity.bestPaceSecPerKm,
        avg_speed_kmh: activity.avgSpeedKmh,
        calories_burned: activity.caloriesBurned,
        elevation_gain_m: activity.elevationGainM,
        coordinates: activity.coordinates,
        splits: activity.splits,
        visibility: activity.visibility,
        xp_earned: activity.xpEarned,
      });

      return !error;
    } catch (e) {
      console.warn('Cloud sync activity error:', e);
      return false;
    }
  }
}

export const supabaseManager = new SupabaseManager();

