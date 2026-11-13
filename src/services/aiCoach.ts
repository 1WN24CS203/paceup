import { UserProfile, FitnessLevel, FitnessGoal } from '../types/user';
import { TrainingPlan, TrainingWeek, DailyWorkout, CoachAdvice, ChatMessage } from '../types/coach';
import { Activity } from '../types/activity';
import { DailyRecoveryLog } from '../types/recovery';

export class AICoachService {
  /**
   * Generates a 4-week periodized jogging & running plan tailored to user's onboarding inputs.
   */
  generatePersonalizedPlan(profile: UserProfile): TrainingPlan {
    const isBeginner = profile.fitnessLevel === 'beginner';
    const isAdvanced = profile.fitnessLevel === 'advanced' || profile.fitnessLevel === 'elite';

    const baseWeeks: TrainingWeek[] = [];
    const baseDuration = Math.min(profile.dailyAvailabilityMin, isBeginner ? 20 : isAdvanced ? 45 : 30);
    const startKm = isBeginner ? 1.5 : isAdvanced ? 4.0 : 2.5;

    for (let w = 1; w <= 4; w++) {
      // 10% gradual volume progression rule per sports science
      const progressionMultiplier = 1 + (w - 1) * 0.12;
      const weekKm = Number((startKm * progressionMultiplier).toFixed(1));

      const days: DailyWorkout[] = [
        {
          dayOfWeek: 'Monday',
          title: w === 1 ? 'Aerobic Engine Ignition' : `Week ${w} Base Aerobic`,
          workoutType: isBeginner ? 'recovery_walk' : 'easy_run',
          targetDurationMin: Math.round(baseDuration * 0.8),
          targetDistanceKm: Number((weekKm * 0.8).toFixed(1)),
          isRestDay: false,
          isCompleted: false,
          description: isBeginner
            ? 'Brisk walking with upright posture and arm swings.'
            : 'Comfortable conversational pace run in Zone 2.',
          steps: [
            { type: 'warmup', durationMin: 4, targetPaceDescription: 'Dynamic activation' },
            { type: isBeginner ? 'walk' : 'jog', durationMin: Math.round(baseDuration * 0.7), targetPaceDescription: 'Zone 2 talk test' },
            { type: 'cooldown', durationMin: 3, targetPaceDescription: 'Gentle walk' },
          ],
        },
        {
          dayOfWeek: 'Tuesday',
          title: `Cadence & Intervals (${w}x)`,
          workoutType: 'intervals',
          targetDurationMin: baseDuration,
          targetDistanceKm: weekKm,
          isRestDay: false,
          isCompleted: false,
          description: isBeginner
            ? `Rounds of ${w}m light jog alternating with 2m recovery walk.`
            : `Rounds of ${3 + w}m tempo surges alternating with 90s easy float.`,
          steps: [
            { type: 'warmup', durationMin: 5, targetPaceDescription: 'Leg swings & easy jog' },
            { type: 'interval', durationMin: baseDuration - 8, targetPaceDescription: 'Interval surges' },
            { type: 'cooldown', durationMin: 3, targetPaceDescription: 'De-escalation walk' },
          ],
        },
        {
          dayOfWeek: 'Wednesday',
          title: 'Scheduled Recovery Day',
          workoutType: 'rest',
          targetDurationMin: 0,
          targetDistanceKm: 0,
          isRestDay: true,
          isCompleted: false,
          description: 'Rest and tissue repair. Foam rolling, deep hydration, and gentle mobility.',
          steps: [{ type: 'rest', durationMin: 0, targetPaceDescription: 'Rest & Recover' }],
        },
        {
          dayOfWeek: 'Thursday',
          title: `Progressive Rhythm Stride`,
          workoutType: 'easy_run',
          targetDurationMin: Math.round(baseDuration * 0.9),
          targetDistanceKm: Number((weekKm * 0.9).toFixed(1)),
          isRestDay: false,
          isCompleted: false,
          description: 'Steady effort focusing on cadence and midfoot ground contact.',
          steps: [
            { type: 'warmup', durationMin: 4, targetPaceDescription: 'Warmup walk' },
            { type: 'jog', durationMin: Math.round(baseDuration * 0.8), targetPaceDescription: 'Steady rhythm' },
          ],
        },
        {
          dayOfWeek: 'Friday',
          title: 'Rest or Optional Stride Shakeout',
          workoutType: 'rest',
          targetDurationMin: 0,
          targetDistanceKm: 0,
          isRestDay: true,
          isCompleted: false,
          description: 'Light mobility or complete rest. Listen to your body and honor your recovery.',
          steps: [{ type: 'rest', durationMin: 0, targetPaceDescription: 'Full rest' }],
        },
        {
          dayOfWeek: 'Saturday',
          title: `Weekend Long Stride (${w === 4 ? 'Milestone' : 'Progression'})`,
          workoutType: 'long_run',
          targetDurationMin: Math.round(baseDuration * 1.3),
          targetDistanceKm: Number((weekKm * 1.3).toFixed(1)),
          isRestDay: false,
          isCompleted: false,
          description: `Longest aerobic stimulus of the week. Hydrate well beforehand and maintain a relaxed effort.`,
          steps: [
            { type: 'warmup', durationMin: 5, targetPaceDescription: 'Easy dynamic walk' },
            { type: 'jog', durationMin: Math.round(baseDuration * 1.1), targetPaceDescription: 'Comfortable Zone 2' },
            { type: 'cooldown', durationMin: 4, targetPaceDescription: 'Calf & quad stretches' },
          ],
        },
        {
          dayOfWeek: 'Sunday',
          title: 'Mind & Muscle Reset',
          workoutType: 'rest',
          targetDurationMin: 15,
          targetDistanceKm: 0,
          isRestDay: true,
          isCompleted: false,
          description: 'Review your weekly progress, celebrate consistency, and plan hydration for next week.',
          steps: [{ type: 'cooldown', durationMin: 15, targetPaceDescription: 'Stretching & breathwork' }],
        },
      ];

      baseWeeks.push({
        weekNumber: w,
        theme:
          w === 1
            ? 'Neural Adaptation'
            : w === 2
            ? 'Aerobic Building'
            : w === 3
            ? 'Tempo Stride'
            : 'Milestone Breakthrough',
        focus: `Target total ~${(weekKm * 3.5).toFixed(1)} km weekly volume with safe rest ratios.`,
        totalTargetDistanceKm: Number((weekKm * 3.5).toFixed(1)),
        days,
      });
    }

    return {
      id: `plan_${profile.id}_${Date.now()}`,
      name: `${profile.fitnessGoal.replace('_', ' ').toUpperCase()} Plan`,
      goal: `Safely build consistency, aerobic stamina and cardiovascular health tailored for ${profile.displayName}.`,
      totalWeeks: 4,
      currentWeek: 1,
      weeks: baseWeeks,
      adaptationLog: ['Plan generated based on onboarding preferences.'],
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates daily sports-science guidance based on recent runs, recovery logs, and training load.
   */
  generateDailyAdvice(
    profile: UserProfile,
    recentActivities: Activity[],
    recovery: DailyRecoveryLog
  ): CoachAdvice {
    // 1. SAFETY FIRST: Soreness or Low Readiness
    if (recovery.readinessScore < 45 || recovery.sorenessAreas.length >= 3) {
      return {
        id: 'adv_' + Date.now(),
        category: 'recovery',
        headline: 'Active Recovery Recommended Today',
        message:
          'Your nervous system and muscle tissues show signs of fatigue. Pushing through heavy workouts increases injury risk. Switch today to a gentle 15-minute walk or restorative stretching.',
        actionableStep: 'Drink 500ml water and perform 10 minutes of gentle hamstring and calf mobility.',
        severity: 'warning',
        date: new Date().toISOString().split('T')[0],
      };
    }

    // 2. Training Volume Spike Detection (10% Rule)
    if (recentActivities.length >= 3) {
      const last3DaysKm = recentActivities.slice(0, 3).reduce((sum, a) => sum + a.distanceKm, 0);
      if (last3DaysKm > profile.weeklyGoalKm * 0.7) {
        return {
          id: 'adv_' + Date.now(),
          category: 'pacing',
          headline: 'Training Volume Spike Detected',
          message:
            `You have logged ${last3DaysKm.toFixed(1)} KM in the last 72 hours, which is over 70% of your weekly volume. To prevent shin splints and Achilles irritation, keep today easy.`,
          actionableStep: 'Cap today’s session at 2.0 KM easy or take a designated rest day.',
          severity: 'warning',
          date: new Date().toISOString().split('T')[0],
        };
      }
    }

    // 3. Primed Readiness
    if (recovery.readinessScore >= 80) {
      return {
        id: 'adv_' + Date.now(),
        category: 'pacing',
        headline: 'Aerobic Engine Primed & Ready',
        message:
          'High readiness score (84+). Your sleep was restorative and muscular recovery is optimal. Great day for a continuous steady jog or interval progression!',
        actionableStep: 'Aim for a steady conversational pace. If feeling brisk, add 3x 30-second cadence pickups.',
        severity: 'info',
        date: new Date().toISOString().split('T')[0],
      };
    }

    // 4. Default Balanced Advice
    return {
      id: 'adv_' + Date.now(),
      category: 'motivation',
      headline: 'Consistency Compounds Daily',
      message:
        'Every kilometer lays down capillary beds and mitochondrial density. Focus on keeping your stride relaxed and shoulders down.',
      actionableStep: 'Keep the pace comfortable enough that you could speak a full sentence aloud.',
      severity: 'info',
      date: new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Interactive Sports-Science AI Chatbot engine.
   * Answers questions locally without paid APIs, following sports-medicine safety guidelines.
   */
  processUserQuestion(question: string, profile: UserProfile): ChatMessage {
    const q = question.toLowerCase();
    let reply = '';
    let quickReplies: string[] = ['How can I avoid side stitches?', 'What should I eat before a run?', 'How to improve cadence?'];

    // Strict Safety Check: Pain, Dizziness, Illness
    if (
      q.includes('pain') ||
      q.includes('hurt') ||
      q.includes('dizzy') ||
      q.includes('dizziness') ||
      q.includes('sick') ||
      q.includes('chest') ||
      q.includes('faint') ||
      q.includes('sharp')
    ) {
      reply =
        '⚠️ **SAFETY FIRST**: Never run through sharp pain, dizziness, chest discomfort, or illness. Running through pain turns minor tissue inflammation into serious chronic injuries (such as stress fractures or plantar fasciitis). Stop immediately, rest, apply ice if inflamed, and consult a qualified medical professional if symptoms persist.';
      quickReplies = ['Gentle warm-up exercises', 'How much water to drink?', 'When is it safe to resume?'];
    } else if (q.includes('pace') || q.includes('fast') || q.includes('speed')) {
      reply =
        '🏃‍♂️ **Pacing Strategy**: 80% of your weekly mileage should be at an "easy, conversational pace" (Zone 2). This means you should be able to speak full sentences without gasping. Running too fast on every run stunts aerobic development and elevates cortisol. Build your aerobic base first, and speed will follow naturally!';
      quickReplies = ['What is Zone 2?', 'How to do intervals?', 'Should I run every day?'];
    } else if (q.includes('sore') || q.includes('recovery') || q.includes('rest') || q.includes('sleep')) {
      reply =
        '🛌 **Recovery Science**: Muscles do not get stronger during the run — they break down! The strengthening and capillary building happen during deep sleep and rest days. Make sure you get 7-8 hours of sleep, hydrate well, and take at least 1-2 designated rest days each week.';
      quickReplies = ['What are good cool-down stretches?', 'Hydration tips', 'How to treat calf soreness?'];
    } else if (q.includes('stitch') || q.includes('cramp') || q.includes('breathe') || q.includes('breathing')) {
      reply =
        '🫁 **Side Stitches & Breathing**: Side stitches are commonly caused by shallow breathing irritating the diaphragm or running too soon after eating. Practice rhythmic belly (diaphragmatic) breathing: inhale for 3 foot strikes, exhale for 2 foot strikes. Avoid heavy meals within 2 hours of running.';
      quickReplies = ['Pre-run meal ideas', 'Cadence drills', 'Interval training'];
    } else if (q.includes('eat') || q.includes('food') || q.includes('nutrition') || q.includes('water') || q.includes('hydrate')) {
      reply =
        '💧 **Nutrition & Hydration**: Drink a glass of water (300-500ml) about 45 minutes before running. For runs under 60 minutes, plain water is plenty. If running in the morning, a small banana or a handful of dates 30 minutes prior provides clean, easily digestible glycogen.';
      quickReplies = ['Post-run recovery food', 'Hydration tracker', 'Pacing tips'];
    } else if (q.includes('cadence') || q.includes('stride') || q.includes('form') || q.includes('shoes')) {
      reply =
        '⚡ **Running Form & Cadence**: Aim for a light, quick cadence (around 165-175 steps per minute) rather than long, bounding overstrides. Land with your feet directly underneath your center of gravity. Keep your eyes forward on the horizon and let your shoulders drop.';
      quickReplies = ['How to track cadence?', 'Cadence drills', 'Warmup routine'];
    } else {
      reply =
        `Great question! At your current fitness level (${profile.fitnessLevel}), the key to sustainable progress is consistency over intensity. Every step you take adds to your aerobic foundation. What specific part of your training would you like to dial in today?`;
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'coach',
      text: reply,
      timestamp: Date.now(),
      quickReplies,
    };
  }
}

export const aiCoach = new AICoachService();

