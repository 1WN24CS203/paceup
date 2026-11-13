export type MuscleArea =
  | 'calves'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'shins'
  | 'lower_back'
  | 'feet';

export interface DailyRecoveryLog {
  id: string;
  date: string;
  readinessScore: number; // 0 to 100
  sleepHours: number;
  sleepQuality: number; // 1 to 5
  energyRating: number; // 1 to 5
  sorenessAreas: MuscleArea[];
  hydrationGlasses: number; // 250ml per glass
  coachAdvice: string;
  isRestDayRecommended: boolean;
}

export interface DynamicRoutineExercise {
  name: string;
  durationSec: number;
  instructions: string;
  targetArea: string;
}

export interface GuidedRoutine {
  id: string;
  type: 'warmup' | 'cooldown';
  title: string;
  durationMin: number;
  exercises: DynamicRoutineExercise[];
}

