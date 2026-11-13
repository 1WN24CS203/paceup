export interface LatLngPoint {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null; // m/s
  accuracy?: number | null; // meters
  timestamp: number;
}

export interface Split {
  kilometer: number;
  durationSec: number;
  paceSecPerKm: number;
  elevationChangeM?: number;
  heartRateAvg?: number;
}

export type ActivityType = 'walk' | 'jog' | 'run' | 'interval' | 'recovery_walk';

export type ActivityVisibility = 'private' | 'friends' | 'public';

export type TrackingState = 'idle' | 'tracking' | 'paused' | 'finished';

export interface Activity {
  id: string;
  userId: string;
  title: string;
  activityType: ActivityType;
  startTime: number;
  endTime: number;
  durationSec: number;
  distanceKm: number;
  avgPaceSecPerKm: number;
  bestPaceSecPerKm: number;
  avgSpeedKmh: number;
  caloriesBurned: number;
  elevationGainM: number;
  coordinates: LatLngPoint[];
  splits: Split[];
  cadenceAvg?: number;
  notes?: string;
  visibility: ActivityVisibility;
  xpEarned: number;
  syncStatus: 'local' | 'synced' | 'pending';
  createdAt: string;
}

export interface LiveTrackingStats {
  durationSec: number;
  distanceKm: number;
  currentPaceSecPerKm: number;
  avgPaceSecPerKm: number;
  currentSpeedKmh: number;
  caloriesBurned: number;
  elevationGainM: number;
  currentAccuracyM: number | null;
  currentSplitKm: number;
  currentSplitSec: number;
  splits: Split[];
  coordinates: LatLngPoint[];
}

