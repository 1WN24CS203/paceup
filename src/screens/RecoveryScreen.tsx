import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { DailyRecoveryLog, GuidedRoutine, MuscleArea } from '../types/recovery';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from '../components/astrix/GlassCard';
import { CircularProgress } from '../components/astrix/CircularProgress';
import { NeonButton } from '../components/astrix/NeonButton';
import { GUIDED_ROUTINES } from '../constants/mockData';
import {
  HeartPulse,
  Moon,
  Zap,
  Droplet,
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

interface RecoveryScreenProps {
  recoveryLog: DailyRecoveryLog;
  onUpdateRecoveryLog: (updated: DailyRecoveryLog) => void;
  onBack: () => void;
}

export const RecoveryScreen: React.FC<RecoveryScreenProps> = ({
  recoveryLog,
  onUpdateRecoveryLog,
  onBack,
}) => {
  const [activeRoutine, setActiveRoutine] = useState<GuidedRoutine | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  const muscleOptions: { key: MuscleArea; label: string }[] = [
    { key: 'calves', label: 'CALVES' },
    { key: 'quadriceps', label: 'QUADS' },
    { key: 'hamstrings', label: 'HAMSTRINGS' },
    { key: 'glutes', label: 'GLUTES' },
    { key: 'shins', label: 'SHINS' },
    { key: 'feet', label: 'FEET / ARCHES' },
  ];

  const handleToggleMuscle = (area: MuscleArea) => {
    const list = recoveryLog.sorenessAreas.includes(area)
      ? recoveryLog.sorenessAreas.filter((a) => a !== area)
      : [...recoveryLog.sorenessAreas, area];

    // Recalculate readiness based on soreness count
    const scoreDeduction = list.length * 8;
    const newScore = Math.max(35, Math.min(100, 95 - scoreDeduction));

    onUpdateRecoveryLog({
      ...recoveryLog,
      sorenessAreas: list,
      readinessScore: newScore,
      isRestDayRecommended: newScore < 50,
    });
  };

  const handleAddWater = () => {
    onUpdateRecoveryLog({
      ...recoveryLog,
      hydrationGlasses: recoveryLog.hydrationGlasses + 1,
    });
  };

  const handleSetSleep = (hours: number) => {
    onUpdateRecoveryLog({
      ...recoveryLog,
      sleepHours: hours,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>HEALTH & RECOVERY</Text>
          <Text style={styles.subtitle}>BIOMETRIC REPAIR ENGINE</Text>
        </View>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>DONE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Readiness Score Card */}
        <GlassCard
          highlight={recoveryLog.readinessScore > 75 ? 'lime' : 'coral'}
          style={styles.scoreCard}
        >
          <View style={styles.scoreRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardPre}>DAILY READINESS SCORE</Text>
              <Text style={styles.readinessStatus}>
                {recoveryLog.readinessScore >= 80
                  ? 'FULLY PRIMED'
                  : recoveryLog.readinessScore >= 60
                  ? 'MODERATE LOAD'
                  : 'REST ADVISORY'}
              </Text>
              <Text style={styles.readinessExplain}>
                {recoveryLog.readinessScore >= 80
                  ? 'Cellular recovery is optimal. Great capacity for aerobic intervals or steady tempo.'
                  : 'Elevated muscle fatigue detected. Prioritize light mobility and hydration.'}
              </Text>
            </View>

            <CircularProgress
              progress={recoveryLog.readinessScore / 100}
              size={100}
              strokeWidth={9}
              color={recoveryLog.readinessScore > 75 ? COLORS.primary : COLORS.coral}
              centerText={`${recoveryLog.readinessScore}`}
              centerSubtext="/ 100"
            />
          </View>
        </GlassCard>

        {/* Hydration Tracker */}
        <GlassCard highlight="cyan" style={styles.hydrationCard}>
          <View style={styles.hydrationHeader}>
            <View style={styles.hydIcon}>
              <Droplet size={18} color={COLORS.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hydTitle}>DAILY HYDRATION TRACKER</Text>
              <Text style={styles.hydAmount}>
                {recoveryLog.hydrationGlasses} Glasses ({recoveryLog.hydrationGlasses * 250} ml)
              </Text>
            </View>
            <TouchableOpacity onPress={handleAddWater} style={styles.addWaterBtn}>
              <Text style={styles.addWaterText}>+ 250ML</Text>
            </TouchableOpacity>
          </View>

          {/* Glasses visualizer */}
          <View style={styles.glassesRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <View
                key={g}
                style={[
                  styles.glassDot,
                  g <= recoveryLog.hydrationGlasses && styles.glassDotFilled,
                ]}
              />
            ))}
          </View>
        </GlassCard>

        {/* Sleep Logging */}
        <GlassCard style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <Moon size={18} color={COLORS.purple} />
            <Text style={styles.sleepTitle}>LAST NIGHT'S REST DURATION</Text>
          </View>
          <View style={styles.sleepHoursRow}>
            {[5, 6, 7, 7.5, 8, 9].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => handleSetSleep(h)}
                style={[
                  styles.hourPill,
                  recoveryLog.sleepHours === h && styles.hourPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.hourPillText,
                    recoveryLog.sleepHours === h && styles.hourPillTextActive,
                  ]}
                >
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Muscle Soreness Body Map */}
        <GlassCard style={styles.sorenessCard}>
          <Text style={styles.sorenessTitle}>MUSCLE TENSION / SORENESS FEEDBACK</Text>
          <Text style={styles.sorenessSub}>
            Tap any muscle areas feeling tight. PACEUP will adapt today's training load.
          </Text>

          <View style={styles.muscleWrap}>
            {muscleOptions.map((item) => {
              const isSelected = recoveryLog.sorenessAreas.includes(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => handleToggleMuscle(item.key)}
                  style={[
                    styles.muscleChip,
                    isSelected && styles.muscleChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.muscleText,
                      isSelected && styles.muscleTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Guided Warm-up & Cool-down Routines */}
        <Text style={styles.sectionHeading}>GUIDED MOBILITY ROUTINES</Text>

        {GUIDED_ROUTINES.map((routine) => (
          <GlassCard key={routine.id} style={styles.routineCard}>
            <View style={styles.routineHeader}>
              <View>
                <Text style={styles.routineType}>{routine.type.toUpperCase()}</Text>
                <Text style={styles.routineTitle}>{routine.title}</Text>
                <Text style={styles.routineDuration}>{routine.durationMin} MIN DURATION</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setActiveRoutine(routine);
                  setExerciseIndex(0);
                }}
                style={styles.playRoutineBtn}
              >
                <Play size={16} color="#08090C" fill="#08090C" />
              </TouchableOpacity>
            </View>

            {/* Exercise Preview List */}
            <View style={styles.exerciseList}>
              {routine.exercises.slice(0, 3).map((ex, idx) => (
                <View key={idx} style={styles.exRow}>
                  <Text style={styles.exBullet}>✦</Text>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exDur}>{ex.durationSec}s</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        ))}

        {/* Medical Non-Claim Notice */}
        <View style={styles.medicalNotice}>
          <ShieldCheck size={14} color={COLORS.textMuted} />
          <Text style={styles.medicalNoticeText}>
            PACEUP estimations and readiness scores are designed for personal fitness guidance only and do not constitute clinical or medical diagnoses.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  subtitle: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.cyan,
    letterSpacing: 1.5,
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  scoreCard: {
    padding: 18,
    marginBottom: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardPre: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  readinessStatus: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  readinessExplain: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 6,
  },
  hydrationCard: {
    padding: 16,
    marginBottom: 14,
  },
  hydrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hydIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hydTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.cyan,
    fontWeight: '800',
  },
  hydAmount: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  addWaterBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addWaterText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: '#08090C',
  },
  glassesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 6,
  },
  glassDot: {
    width: 24,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glassDotFilled: {
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  sleepCard: {
    padding: 16,
    marginBottom: 14,
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sleepTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.purple,
    fontWeight: '800',
  },
  sleepHoursRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hourPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hourPillActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: COLORS.purple,
  },
  hourPillText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  hourPillTextActive: {
    color: COLORS.purple,
  },
  sorenessCard: {
    padding: 16,
    marginBottom: 14,
  },
  sorenessTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textPrimary,
    fontWeight: '800',
    marginBottom: 4,
  },
  sorenessSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: 12,
  },
  muscleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  muscleChipActive: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    borderColor: COLORS.coral,
  },
  muscleText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  muscleTextActive: {
    color: COLORS.coral,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 10,
  },
  routineCard: {
    padding: 16,
    marginBottom: 12,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routineType: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  routineTitle: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  routineDuration: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  playRoutineBtn: {
    backgroundColor: COLORS.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    gap: 6,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exBullet: {
    color: COLORS.primary,
    fontSize: 8,
  },
  exName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  exDur: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  medicalNotice: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  medicalNoticeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    flex: 1,
  },
});
