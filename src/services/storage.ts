import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from '../types/activity';
import { UserProfile } from '../types/user';
import { TrainingPlan } from '../types/coach';
import { Achievement, DailyMission } from '../types/gamification';
import { JoggingRoute } from '../types/routes';
import { ActivityFeedItem, RunningClub } from '../types/community';
import { DailyRecoveryLog } from '../types/recovery';
import {
  INITIAL_USER_PROFILE,
  INITIAL_ACTIVITIES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_DAILY_MISSIONS,
  DISCOVER_ROUTES,
  COMMUNITY_FEED,
  RUNNING_CLUBS,
  INITIAL_RECOVERY_LOG,
} from '../constants/mockData';
import { TRAINING_PLANS } from '../constants/plans';

const STORAGE_KEYS = {
  USER_PROFILE: '@paceup_user_profile',
  ACTIVITIES: '@paceup_activities',
  TRAINING_PLAN: '@paceup_training_plan',
  ACHIEVEMENTS: '@paceup_achievements',
  DAILY_MISSIONS: '@paceup_daily_missions',
  CUSTOM_ROUTES: '@paceup_custom_routes',
  FAVORITE_ROUTES: '@paceup_fav_routes',
  COMMUNITY_FEED: '@paceup_feed',
  CLUBS: '@paceup_clubs',
  RECOVERY_LOGS: '@paceup_recovery_logs',
  SUPABASE_CONFIG: '@paceup_supabase_config',
};

// In-memory fallback in case of platform storage limitation
const memoryCache: Record<string, string> = {};

class StorageService {
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    try {
      const profile = await this.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!profile) {
        // Seed default initial data
        await this.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
        await this.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
        await this.setItem(STORAGE_KEYS.TRAINING_PLAN, JSON.stringify(TRAINING_PLANS.couch_to_5k));
        await this.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
        await this.setItem(STORAGE_KEYS.DAILY_MISSIONS, JSON.stringify(INITIAL_DAILY_MISSIONS));
        await this.setItem(STORAGE_KEYS.CUSTOM_ROUTES, JSON.stringify([]));
        await this.setItem(STORAGE_KEYS.FAVORITE_ROUTES, JSON.stringify(['route_1']));
        await this.setItem(STORAGE_KEYS.COMMUNITY_FEED, JSON.stringify(COMMUNITY_FEED));
        await this.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(RUNNING_CLUBS));
        await this.setItem(STORAGE_KEYS.RECOVERY_LOGS, JSON.stringify([INITIAL_RECOVERY_LOG]));
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('StorageService init error, using memory cache:', e);
      this.isInitialized = true;
    }
  }

  private async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return memoryCache[key] || null;
    } catch {
      return memoryCache[key] || null;
    }
  }

  private async setItem(key: string, value: string): Promise<void> {
    try {
      memoryCache[key] = value;
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryCache[key] = value;
    }
  }

  // --- Profile ---
  async getProfile(): Promise<UserProfile> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : INITIAL_USER_PROFILE;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // --- Activities ---
  async getActivities(): Promise<Activity[]> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
  }

  async saveActivity(activity: Activity): Promise<void> {
    const list = await this.getActivities();
    const updated = [activity, ...list.filter((a) => a.id !== activity.id)];
    await this.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));

    // Also update user lifetime stats
    const profile = await this.getProfile();
    const newDistance = Number((profile.lifetimeDistanceKm + activity.distanceKm).toFixed(2));
    const newDuration = profile.lifetimeDurationSec + activity.durationSec;
    const newRuns = profile.lifetimeRuns + 1;
    const newXp = profile.xp + activity.xpEarned;
    const newLevel = Math.max(profile.level, Math.floor(Math.sqrt(newXp / 250)) + 1);

    // Update streak: if last active was yesterday, streak + 1; if today, keep; else reset or streak freeze
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streakCount;
    if (profile.lastActiveDate !== today) {
      newStreak += 1;
    }

    await this.saveProfile({
      ...profile,
      lifetimeDistanceKm: newDistance,
      lifetimeDurationSec: newDuration,
      lifetimeRuns: newRuns,
      xp: newXp,
      level: newLevel,
      streakCount: newStreak,
      lastActiveDate: today,
    });
  }

  async deleteActivity(id: string): Promise<void> {
    const list = await this.getActivities();
    const updated = list.filter((a) => a.id !== id);
    await this.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
  }

  // --- Training Plan ---
  async getTrainingPlan(): Promise<TrainingPlan> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.TRAINING_PLAN);
    return raw ? JSON.parse(raw) : TRAINING_PLANS.couch_to_5k;
  }

  async saveTrainingPlan(plan: TrainingPlan): Promise<void> {
    await this.setItem(STORAGE_KEYS.TRAINING_PLAN, JSON.stringify(plan));
  }

  // --- Gamification ---
  async getAchievements(): Promise<Achievement[]> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return raw ? JSON.parse(raw) : INITIAL_ACHIEVEMENTS;
  }

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  async getDailyMissions(): Promise<DailyMission[]> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.DAILY_MISSIONS);
    return raw ? JSON.parse(raw) : INITIAL_DAILY_MISSIONS;
  }

  async saveDailyMissions(missions: DailyMission[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.DAILY_MISSIONS, JSON.stringify(missions));
  }

  // --- Routes ---
  async getAllRoutes(): Promise<JoggingRoute[]> {
    await this.init();
    const rawCustom = await this.getItem(STORAGE_KEYS.CUSTOM_ROUTES);
    const customRoutes: JoggingRoute[] = rawCustom ? JSON.parse(rawCustom) : [];
    const rawFavs = await this.getItem(STORAGE_KEYS.FAVORITE_ROUTES);
    const favIds: string[] = rawFavs ? JSON.parse(rawFavs) : ['route_1'];

    const all = [...DISCOVER_ROUTES, ...customRoutes];
    return all.map((r) => ({
      ...r,
      isFavorite: favIds.includes(r.id),
    }));
  }

  async saveCustomRoute(route: JoggingRoute): Promise<void> {
    const raw = await this.getItem(STORAGE_KEYS.CUSTOM_ROUTES);
    const list: JoggingRoute[] = raw ? JSON.parse(raw) : [];
    const updated = [route, ...list];
    await this.setItem(STORAGE_KEYS.CUSTOM_ROUTES, JSON.stringify(updated));
  }

  async toggleFavoriteRoute(routeId: string): Promise<boolean> {
    const raw = await this.getItem(STORAGE_KEYS.FAVORITE_ROUTES);
    let favIds: string[] = raw ? JSON.parse(raw) : [];
    const isFav = favIds.includes(routeId);
    if (isFav) {
      favIds = favIds.filter((id) => id !== routeId);
    } else {
      favIds.push(routeId);
    }
    await this.setItem(STORAGE_KEYS.FAVORITE_ROUTES, JSON.stringify(favIds));
    return !isFav;
  }

  // --- Community Feed ---
  async getCommunityFeed(): Promise<ActivityFeedItem[]> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.COMMUNITY_FEED);
    return raw ? JSON.parse(raw) : COMMUNITY_FEED;
  }

  async saveCommunityFeed(feed: ActivityFeedItem[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.COMMUNITY_FEED, JSON.stringify(feed));
  }

  async toggleKudos(activityId: string): Promise<ActivityFeedItem[]> {
    const feed = await this.getCommunityFeed();
    const updated = feed.map((item) => {
      if (item.id === activityId) {
        const hasGiven = !item.hasGivenKudos;
        return {
          ...item,
          hasGivenKudos: hasGiven,
          kudosCount: hasGiven ? item.kudosCount + 1 : Math.max(0, item.kudosCount - 1),
        };
      }
      return item;
    });
    await this.saveCommunityFeed(updated);
    return updated;
  }

  async addComment(activityId: string, commentText: string): Promise<ActivityFeedItem[]> {
    const feed = await this.getCommunityFeed();
    const profile = await this.getProfile();
    const updated = feed.map((item) => {
      if (item.id === activityId) {
        const newComment = {
          id: 'comment_' + Date.now(),
          userId: profile.id,
          userName: profile.displayName,
          userAvatar: profile.avatarUrl,
          text: commentText,
          createdAt: 'Just now',
        };
        return {
          ...item,
          commentsCount: item.commentsCount + 1,
          comments: [...item.comments, newComment],
        };
      }
      return item;
    });
    await this.saveCommunityFeed(updated);
    return updated;
  }

  // --- Running Clubs ---
  async getClubs(): Promise<RunningClub[]> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.CLUBS);
    return raw ? JSON.parse(raw) : RUNNING_CLUBS;
  }

  async toggleJoinClub(clubId: string): Promise<RunningClub[]> {
    const clubs = await this.getClubs();
    const updated = clubs.map((c) => {
      if (c.id === clubId) {
        const nextState = !c.isJoined;
        return {
          ...c,
          isJoined: nextState,
          memberCount: nextState ? c.memberCount + 1 : Math.max(1, c.memberCount - 1),
        };
      }
      return c;
    });
    await this.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(updated));
    return updated;
  }

  // --- Recovery Logs ---
  async getRecoveryLog(): Promise<DailyRecoveryLog> {
    await this.init();
    const raw = await this.getItem(STORAGE_KEYS.RECOVERY_LOGS);
    const list: DailyRecoveryLog[] = raw ? JSON.parse(raw) : [INITIAL_RECOVERY_LOG];
    return list[0] || INITIAL_RECOVERY_LOG;
  }

  async saveRecoveryLog(log: DailyRecoveryLog): Promise<void> {
    await this.setItem(STORAGE_KEYS.RECOVERY_LOGS, JSON.stringify([log]));
  }

  // --- Export Data ---
  async exportUserData(): Promise<string> {
    const profile = await this.getProfile();
    const activities = await this.getActivities();
    const achievements = await this.getAchievements();
    const recovery = await this.getRecoveryLog();

    const exportPayload = {
      app: 'PACEUP',
      tagline: 'Every step counts. Every day levels you up.',
      exportedAt: new Date().toISOString(),
      user: profile,
      activitiesCount: activities.length,
      activities,
      achievements,
      recovery,
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  async resetData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
      this.isInitialized = false;
      await this.init();
    } catch (e) {
      console.warn('Reset data error:', e);
    }
  }
}

export const storage = new StorageService();

