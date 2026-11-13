export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  activityTitle: string;
  activityType: 'walk' | 'jog' | 'run' | 'interval' | 'recovery_walk';
  distanceKm: number;
  durationSec: number;
  paceMinKm: string;
  caloriesBurned: number;
  kudosCount: number;
  hasGivenKudos: boolean;
  commentsCount: number;
  comments: CommunityComment[];
  routeThumbnailUrl?: string;
  createdAt: string;
  badgesEarned?: string[];
}

export interface RunningClub {
  id: string;
  name: string;
  tagline: string;
  memberCount: number;
  weeklyGoalKm: number;
  weeklyCurrentKm: number;
  coverImage: string;
  isJoined: boolean;
  city: string;
  badge: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  targetKm: number;
  currentKm: number;
  participantsCount: number;
  daysRemaining: number;
  rewardBadge: string;
  rewardXp: number;
  isJoined: boolean;
}
