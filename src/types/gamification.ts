export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
  perk: string;
  glowColor: string;
}

export type AchievementCategory = 'distance' | 'consistency' | 'speed' | 'special' | 'milestone';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: AchievementCategory;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0.0 to 1.0
  requirementLabel: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetMetric: 'steps' | 'distance_km' | 'duration_min' | 'jog_session';
  targetValue: number;
  currentValue: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  displayName: string;
  avatarUrl: string;
  weeklyDistanceKm: number;
  streakCount: number;
  level: number;
  isCurrentUser?: boolean;
}

