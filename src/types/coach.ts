export interface WorkoutStep {
  type: 'warmup' | 'run' | 'jog' | 'walk' | 'interval' | 'cooldown' | 'rest';
  durationMin: number;
  targetPaceDescription: string;
  notes?: string;
}

export interface DailyWorkout {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  title: string;
  workoutType: 'easy_run' | 'intervals' | 'recovery_walk' | 'long_run' | 'tempo' | 'rest';
  targetDurationMin: number;
  targetDistanceKm: number;
  isRestDay: boolean;
  isCompleted: boolean;
  description: string;
  steps: WorkoutStep[];
}

export interface TrainingWeek {
  weekNumber: number;
  theme: string;
  focus: string;
  totalTargetDistanceKm: number;
  days: DailyWorkout[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  goal: string;
  totalWeeks: number;
  currentWeek: number;
  weeks: TrainingWeek[];
  adaptationLog: string[];
  createdAt: string;
}

export interface CoachAdvice {
  id: string;
  category: 'pacing' | 'recovery' | 'hydration' | 'injury_prevention' | 'motivation';
  headline: string;
  message: string;
  actionableStep?: string;
  severity: 'info' | 'warning' | 'urgent';
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: number;
  quickReplies?: string[];
}

