import { Achievement, DailyMission, LevelTier } from '../types/gamification';
import { UserProfile } from '../types/user';
import { Activity } from '../types/activity';
import { LEVEL_TIERS } from '../constants/mockData';

export class GamificationEngine {
  /**
   * Calculates XP earned from a completed activity.
   */
  calculateActivityXp(
    distanceKm: number,
    durationSec: number,
    streakCount: number,
    isFirstActivityToday: boolean
  ): { totalXp: number; breakdown: { label: string; xp: number }[] } {
    const breakdown: { label: string; xp: number }[] = [];

    // Distance XP: 60 XP per KM
    const distanceXp = Math.round(distanceKm * 60);
    breakdown.push({ label: `${distanceKm.toFixed(2)} KM Distance`, xp: distanceXp });

    // Duration XP: 10 XP per 3 active minutes
    const durationXp = Math.round((durationSec / 180) * 10);
    breakdown.push({ label: `${Math.round(durationSec / 60)} Active Min`, xp: durationXp });

    // Streak Multiplier Bonus
    if (streakCount > 0) {
      const streakBonus = Math.min(150, streakCount * 15);
      breakdown.push({ label: `${streakCount}-Day Streak Bonus`, xp: streakBonus });
    }

    // Daily First Stride Bonus
    if (isFirstActivityToday) {
      breakdown.push({ label: 'Daily First Stride Bonus', xp: 50 });
    }

    const totalXp = breakdown.reduce((sum, item) => sum + item.xp, 0);
    return { totalXp, breakdown };
  }

  /**
   * Evaluates current user level and progress percentage based on XP.
   */
  getLevelInfo(xp: number): {
    currentLevel: LevelTier;
    nextLevel: LevelTier | null;
    progressPercent: number;
    xpToNextLevel: number;
  } {
    let currentLevel = LEVEL_TIERS[0];
    let nextLevel: LevelTier | null = LEVEL_TIERS[1] || null;

    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      if (xp >= LEVEL_TIERS[i].minXp) {
        currentLevel = LEVEL_TIERS[i];
        nextLevel = LEVEL_TIERS[i + 1] || null;
      }
    }

    if (!nextLevel) {
      return {
        currentLevel,
        nextLevel: null,
        progressPercent: 100,
        xpToNextLevel: 0,
      };
    }

    const range = nextLevel.minXp - currentLevel.minXp;
    const progressInTier = xp - currentLevel.minXp;
    const progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / range) * 100)));
    const xpToNextLevel = Math.max(0, nextLevel.minXp - xp);

    return {
      currentLevel,
      nextLevel,
      progressPercent,
      xpToNextLevel,
    };
  }

  /**
   * Evaluates and updates achievements against lifetime metrics and the newest activity.
   */
  evaluateAchievements(
    currentAchievements: Achievement[],
    profile: UserProfile,
    newActivity: Activity
  ): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
    const newlyUnlocked: Achievement[] = [];
    const updated = currentAchievements.map((ach) => {
      if (ach.isUnlocked) return ach;

      let progress = ach.progress;
      let shouldUnlock = false;

      switch (ach.id) {
        case 'first_1k':
          progress = Math.min(1.0, profile.lifetimeDistanceKm / 1.0);
          if (newActivity.distanceKm >= 1.0 || profile.lifetimeDistanceKm >= 1.0) shouldUnlock = true;
          break;
        case 'first_5k':
          progress = Math.min(1.0, newActivity.distanceKm / 5.0);
          if (newActivity.distanceKm >= 5.0) shouldUnlock = true;
          break;
        case 'first_10k':
          progress = Math.min(1.0, newActivity.distanceKm / 10.0);
          if (newActivity.distanceKm >= 10.0) shouldUnlock = true;
          break;
        case 'streak_7':
          progress = Math.min(1.0, profile.streakCount / 7.0);
          if (profile.streakCount >= 7) shouldUnlock = true;
          break;
        case 'lifetime_50k':
          progress = Math.min(1.0, profile.lifetimeDistanceKm / 50.0);
          if (profile.lifetimeDistanceKm >= 50.0) shouldUnlock = true;
          break;
        case 'early_bird':
          const hour = new Date(newActivity.startTime).getHours();
          if (hour < 7) {
            progress = 1.0;
            shouldUnlock = true;
          }
          break;
        case 'speed_demon':
          if (newActivity.bestPaceSecPerKm > 0 && newActivity.bestPaceSecPerKm <= 300) {
            progress = 1.0;
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        const unlockedAch = {
          ...ach,
          isUnlocked: true,
          unlockedAt: new Date().toISOString().split('T')[0],
          progress: 1.0,
        };
        newlyUnlocked.push(unlockedAch);
        return unlockedAch;
      }

      return { ...ach, progress: Number(progress.toFixed(2)) };
    });

    return { updatedAchievements: updated, newlyUnlocked };
  }

  /**
   * Updates daily mission progress with completed activity stats.
   */
  updateDailyMissions(missions: DailyMission[], activity: Activity): DailyMission[] {
    return missions.map((mission) => {
      let addVal = 0;
      if (mission.targetMetric === 'distance_km') {
        addVal = activity.distanceKm;
      } else if (mission.targetMetric === 'duration_min') {
        addVal = Math.round(activity.durationSec / 60);
      } else if (mission.targetMetric === 'jog_session') {
        addVal = 1;
      } else if (mission.targetMetric === 'steps') {
        // Approximate steps: ~1300 steps per km
        addVal = Math.round(activity.distanceKm * 1300);
      }

      const newVal = Number((mission.currentValue + addVal).toFixed(1));
      const completed = newVal >= mission.targetValue;
      return {
        ...mission,
        currentValue: newVal,
        isCompleted: completed,
      };
    });
  }
}

export const gamificationEngine = new GamificationEngine();

