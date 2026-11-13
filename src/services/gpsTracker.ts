import * as Location from 'expo-location';
import { LatLngPoint, LiveTrackingStats, Split, ActivityType } from '../types/activity';

export interface TrackerCallbacks {
  onStatsUpdate: (stats: LiveTrackingStats) => void;
  onSplitCompleted?: (split: Split) => void;
  onError?: (errorMsg: string) => void;
}

export class GPSTrackerService {
  private isTracking = false;
  private isPaused = false;
  private isSimulation = false;

  private startTime = 0;
  private pausedTimeAccumulator = 0;
  private pauseStartedAt = 0;

  private coordinates: LatLngPoint[] = [];
  private splits: Split[] = [];

  private timerInterval: any = null;
  private simulationInterval: any = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private webWatchId: number | null = null;

  private callbacks: TrackerCallbacks | null = null;

  // Running statistics
  private totalDistanceKm = 0;
  private currentSplitKm = 0;
  private currentSplitStartTime = 0;
  private elevationGainM = 0;
  private lastAltitude: number | null = null;
  private recentPointsForPace: LatLngPoint[] = [];
  private userWeightKg = 70; // Default fallback
  private activityType: ActivityType = 'jog';

  // Preset scenic simulation route (San Francisco Embarcadero Waterfront)
  private simulationRoute: { lat: number; lng: number; alt: number }[] = [
    { lat: 37.795, lng: -122.398, alt: 6 },
    { lat: 37.7965, lng: -122.3995, alt: 7 },
    { lat: 37.7985, lng: -122.4012, alt: 8 },
    { lat: 37.8005, lng: -122.4035, alt: 9 },
    { lat: 37.8028, lng: -122.4058, alt: 11 },
    { lat: 37.8052, lng: -122.4082, alt: 13 },
    { lat: 37.8075, lng: -122.4105, alt: 14 },
    { lat: 37.8098, lng: -122.413, alt: 15 },
    { lat: 37.8122, lng: -122.4158, alt: 16 },
    { lat: 37.814, lng: -122.418, alt: 17 },
    { lat: 37.8155, lng: -122.4202, alt: 18 },
    { lat: 37.8172, lng: -122.4225, alt: 19 },
    { lat: 37.8188, lng: -122.425, alt: 20 },
    { lat: 37.8205, lng: -122.428, alt: 22 },
  ];
  private simIndex = 0;

  setUserWeight(weightKg: number) {
    if (weightKg > 30) this.userWeightKg = weightKg;
  }

  setActivityType(type: ActivityType) {
    this.activityType = type;
  }

  async startTracking(callbacks: TrackerCallbacks, simulateMode: boolean = false): Promise<boolean> {
    this.callbacks = callbacks;
    this.isSimulation = simulateMode;
    this.isTracking = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedTimeAccumulator = 0;
    this.coordinates = [];
    this.splits = [];
    this.totalDistanceKm = 0;
    this.currentSplitKm = 0;
    this.currentSplitStartTime = this.startTime;
    this.elevationGainM = 0;
    this.lastAltitude = null;
    this.recentPointsForPace = [];
    this.simIndex = 0;

    // Start 1-second UI tick
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && this.isTracking) {
        this.emitStats();
      }
    }, 1000);

    if (this.isSimulation) {
      this.startSimulationStream();
      return true;
    }

    // Real device GPS tracking
    return await this.startDeviceLocationStream();
  }

  private async startDeviceLocationStream(): Promise<boolean> {
    try {
      // Check if running on web with navigator.geolocation
      if (typeof window !== 'undefined' && navigator && navigator.geolocation) {
        this.webWatchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (this.isPaused || !this.isTracking) return;
            this.handleNewLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude,
              speed: pos.coords.speed,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp || Date.now(),
            });
          },
          (err) => {
            console.warn('Web Geolocation error:', err.message);
            if (this.callbacks?.onError) {
              this.callbacks.onError(`GPS Signal: ${err.message}`);
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
        return true;
      }

      // Native Expo Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (this.callbacks?.onError) {
          this.callbacks.onError('Location permission denied. Please enable GPS in device settings.');
        }
        return false;
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 2,
        },
        (loc) => {
          if (this.isPaused || !this.isTracking) return;
          this.handleNewLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            altitude: loc.coords.altitude,
            speed: loc.coords.speed,
            accuracy: loc.coords.accuracy,
            timestamp: loc.timestamp,
          });
        }
      );
      return true;
    } catch (err: any) {
      console.warn('Start GPS Error:', err);
      if (this.callbacks?.onError) {
        this.callbacks.onError(err.message || 'Failed to start GPS tracking.');
      }
      return false;
    }
  }

  private startSimulationStream() {
    // Generate realistic runner coordinates moving at ~10 km/h (2.77 m/s)
    this.simulationInterval = setInterval(() => {
      if (this.isPaused || !this.isTracking) return;

      const target = this.simulationRoute[this.simIndex % this.simulationRoute.length];
      // Add slight micro-variance to mimic natural foot-strike cadence
      const microJitterLat = (Math.random() - 0.5) * 0.00005;
      const microJitterLng = (Math.random() - 0.5) * 0.00005;

      const point: LatLngPoint = {
        latitude: target.lat + microJitterLat,
        longitude: target.lng + microJitterLng,
        altitude: target.alt + Math.sin(this.simIndex) * 2,
        speed: 2.75 + (Math.random() - 0.5) * 0.4, // ~9.9 km/h
        accuracy: 4,
        timestamp: Date.now(),
      };

      this.handleNewLocation(point);
      this.simIndex++;
    }, 1500);
  }

  private handleNewLocation(point: LatLngPoint) {
    // 1. FILTER: Inaccurate GPS Jump Rejection
    if (point.accuracy !== null && point.accuracy !== undefined && point.accuracy > 35) {
      // Reject points with accuracy worse than 35 meters
      return;
    }

    if (this.coordinates.length > 0) {
      const prev = this.coordinates[this.coordinates.length - 1];
      const distMeters = this.calculateHaversineMeters(prev.latitude, prev.longitude, point.latitude, point.longitude);
      const timeDeltaSec = Math.max(1, (point.timestamp - prev.timestamp) / 1000);
      const computedSpeedMs = distMeters / timeDeltaSec;

      // 2. FILTER: Unrealistic Speed Jump (> 11.5 m/s = > 41 km/h)
      if (computedSpeedMs > 11.5) {
        return; // Ignore sudden GPS teleportation
      }

      // 3. FILTER: Stationary Jitter (< 2.0 meters in 1 second)
      if (distMeters < 2.0 && timeDeltaSec <= 2) {
        return;
      }

      const distKm = distMeters / 1000;
      this.totalDistanceKm += distKm;
      this.currentSplitKm += distKm;

      // Check elevation gain
      if (point.altitude !== null && point.altitude !== undefined) {
        if (this.lastAltitude !== null) {
          const elevDiff = point.altitude - this.lastAltitude;
          if (elevDiff > 1.2) {
            this.elevationGainM += elevDiff;
          }
        }
        this.lastAltitude = point.altitude;
      }

      // Check for split milestone (every 1.0 km)
      if (this.currentSplitKm >= 1.0) {
        const splitIndex = this.splits.length + 1;
        const now = Date.now();
        const splitDurationSec = Math.round((now - this.currentSplitStartTime) / 1000);
        const splitPace = Math.round(splitDurationSec / this.currentSplitKm);

        const newSplit: Split = {
          kilometer: splitIndex,
          durationSec: splitDurationSec,
          paceSecPerKm: splitPace,
          elevationChangeM: Math.round(this.elevationGainM),
        };

        this.splits.push(newSplit);
        this.currentSplitKm = 0;
        this.currentSplitStartTime = now;

        if (this.callbacks?.onSplitCompleted) {
          this.callbacks.onSplitCompleted(newSplit);
        }
      }
    } else {
      if (point.altitude !== null && point.altitude !== undefined) {
        this.lastAltitude = point.altitude;
      }
    }

    this.coordinates.push(point);

    // Keep rolling window for pace calculation (last 6 points)
    this.recentPointsForPace.push(point);
    if (this.recentPointsForPace.length > 8) {
      this.recentPointsForPace.shift();
    }

    this.emitStats();
  }

  pause() {
    if (!this.isTracking || this.isPaused) return;
    this.isPaused = true;
    this.pauseStartedAt = Date.now();
  }

  resume() {
    if (!this.isTracking || !this.isPaused) return;
    this.isPaused = false;
    this.pausedTimeAccumulator += Date.now() - this.pauseStartedAt;
  }

  stopTracking() {
    this.isTracking = false;
    this.isPaused = false;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    if (this.webWatchId !== null && typeof window !== 'undefined' && navigator && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.webWatchId);
      this.webWatchId = null;
    }
  }

  getElapsedSeconds(): number {
    if (this.startTime === 0) return 0;
    const now = this.isPaused ? this.pauseStartedAt : Date.now();
    const elapsedMs = now - this.startTime - this.pausedTimeAccumulator;
    return Math.max(0, Math.floor(elapsedMs / 1000));
  }

  private calculateCurrentPaceSecPerKm(): number {
    if (this.recentPointsForPace.length < 2) return 0;
    const pFirst = this.recentPointsForPace[0];
    const pLast = this.recentPointsForPace[this.recentPointsForPace.length - 1];
    const dt = (pLast.timestamp - pFirst.timestamp) / 1000;
    if (dt <= 0) return 0;

    let distMeters = 0;
    for (let i = 1; i < this.recentPointsForPace.length; i++) {
      distMeters += this.calculateHaversineMeters(
        this.recentPointsForPace[i - 1].latitude,
        this.recentPointsForPace[i - 1].longitude,
        this.recentPointsForPace[i].latitude,
        this.recentPointsForPace[i].longitude
      );
    }

    if (distMeters < 5) return 0;
    const speedMs = distMeters / dt;
    if (speedMs < 0.5) return 0; // Walking slower than 0.5 m/s (~1.8 km/h) or stopped

    const paceSec = 1000 / speedMs;
    // Cap pace display realistically between 2:30 min/km (150s) and 18:00 min/km (1080s)
    return Math.min(1080, Math.max(150, Math.round(paceSec)));
  }

  private calculateCaloriesBurned(durationSec: number): number {
    // MET values: Walking: 3.8, Jogging: 7.0, Running: 9.8, Interval: 8.5
    let met = 7.0;
    if (this.activityType === 'walk' || this.activityType === 'recovery_walk') met = 3.8;
    else if (this.activityType === 'run') met = 9.8;
    else if (this.activityType === 'interval') met = 8.5;

    const hours = durationSec / 3600;
    return Math.round(met * this.userWeightKg * hours);
  }

  private emitStats() {
    if (!this.callbacks) return;

    const durationSec = this.getElapsedSeconds();
    const currentPace = this.calculateCurrentPaceSecPerKm();
    const avgPace = this.totalDistanceKm > 0.05 ? Math.round(durationSec / this.totalDistanceKm) : 0;
    const currentSpeedKmh = currentPace > 0 ? Number((3600 / currentPace).toFixed(1)) : 0;
    const calories = this.calculateCaloriesBurned(durationSec);

    const latestPoint = this.coordinates.length > 0 ? this.coordinates[this.coordinates.length - 1] : null;
    const currentSplitSec = Math.round((Date.now() - this.currentSplitStartTime) / 1000);

    this.callbacks.onStatsUpdate({
      durationSec,
      distanceKm: Number(this.totalDistanceKm.toFixed(3)),
      currentPaceSecPerKm: currentPace,
      avgPaceSecPerKm: avgPace,
      currentSpeedKmh,
      caloriesBurned: calories,
      elevationGainM: Math.round(this.elevationGainM),
      currentAccuracyM: latestPoint ? Math.round(latestPoint.accuracy || 5) : null,
      currentSplitKm: Number(this.currentSplitKm.toFixed(2)),
      currentSplitSec,
      splits: [...this.splits],
      coordinates: [...this.coordinates],
    });
  }

  private calculateHaversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const gpsTracker = new GPSTrackerService();

