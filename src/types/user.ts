export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type FitnessGoal =
  | 'habit_building'
  | 'weight_management'
  | '5k_prep'
  | '10k_prep'
  | 'half_marathon'
  | 'endurance';

export interface UserPreferences {
  audioPaceAnnouncements: boolean;
  audioSplitFrequencyKm: number; // 0.5, 1.0, 2.0
  units: 'metric' | 'imperial';
  darkMode: boolean;
  hapticFeedback: boolean;
  reminderMorning: boolean;
  reminderEvening: boolean;
  reminderTime: string; // "07:00"
  privacyHideHomeRadiusKm: number;
  shareToFeedByDefault: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  age: number;
  heightCm: number;
  weightKg: number;
  fitnessLevel: FitnessLevel;
  fitnessGoal: FitnessGoal;
  weeklyGoalKm: number;
  dailyAvailabilityMin: number;
  preferredActivity: 'walk' | 'jog' | 'run';
  streakCount: number;
  streakFreezeCount: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  xp: number;
  level: number;
  lifetimeDistanceKm: number;
  lifetimeRuns: number;
  lifetimeDurationSec: number;
  isProfilePrivate: boolean;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
}

