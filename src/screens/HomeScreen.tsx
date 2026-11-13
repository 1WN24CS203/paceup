import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { UserProfile } from '../types/user';
import { Activity } from '../types/activity';
import { DailyMission } from '../types/gamification';
import { CoachAdvice } from '../types/coach';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { AstrixHeader } from '../components/astrix/AstrixHeader';
import { TickerTape } from '../components/astrix/TickerTape';
import { MetricCard } from '../components/astrix/MetricCard';
import { CircularProgress } from '../components/astrix/CircularProgress';
import { NeonButton } from '../components/astrix/NeonButton';
import { GlassCard } from '../components/astrix/GlassCard';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';
import {
  Flame,
  Zap,
  Play,
  Bot,
  Footprints,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Activity as ActivityIcon,
  CheckCircle2,
} from 'lucide-react-native';

interface HomeScreenProps {
  profile: UserProfile;
  recentActivities: Activity[];
  dailyMissions: DailyMission[];
  coachAdvice: CoachAdvice;
  onStartRun: () => void;
  onOpenCoachChat: () => void;
  onOpenRouteExplorer: () => void;
  onOpenRecovery: () => void;
  onClaimMission: (missionId: string) => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  recentActivities,
  dailyMissions,
  coachAdvice,
  onStartRun,
  onOpenCoachChat,
  onOpenRouteExplorer,
  onOpenRecovery,
  onClaimMission,
  onOpenProfile,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Compute today's total distance
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayActivities = recentActivities.filter(
    (a) => new Date(a.startTime).toISOString().split('T')[0] === todayDateStr
  );
  const todayDistanceKm = todayActivities.reduce((sum, a) => sum + a.distanceKm, 0);
  const todayCalories = todayActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const todayDurationSec = todayActivities.reduce((sum, a) => sum + a.durationSec, 0);
  const todayActiveMin = Math.round(todayDurationSec / 60);

  // Weekly Goal Progress
  const dailyGoalKm = Number((profile.weeklyGoalKm / 5).toFixed(1)); // 5 active days goal
  const goalProgress = Math.min(1.0, todayDistanceKm / (dailyGoalKm || 3.0));

  // 7-Day breakdown for weekly chart
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
  const mockWeeklyData = weekDays.map((d, i) => {
    if (i === currentDayIdx) return { dayLabel: d, km: todayDistanceKm, isToday: true };
    if (i < currentDayIdx) return { dayLabel: d, km: Number((Math.random() * 3 + 2).toFixed(1)) };
    return { dayLabel: d, km: 0 };
  });

  return (
    <View style={styles.container}>
      {/* Astrix Brand Header */}
      <AstrixHeader
        streakCount={profile.streakCount}
        level={profile.level}
        onPressProfile={onOpenProfile}
      />

      {/* Dynamic Animated Marquee Ticker */}
      <TickerTape
        items={[
          `PACEUP // LEVEL ${profile.level} ${profile.fitnessLevel.toUpperCase()}`,
          `STREAK: ${profile.streakCount} DAYS UNBROKEN`,
          `LIFETIME: ${profile.lifetimeDistanceKm.toFixed(1)} KM LOGGED`,
          'EVERY STEP COUNTS // NO PAYWALLS',
          'AI COACH: ACTIVE RECOVERY PRIMED',
        ]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Goal Hero Section */}
        <GlassCard highlight="lime" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroPretitle}>TODAY'S STRIDE TARGET</Text>
              <Text style={styles.heroTitle}>
                {todayDistanceKm.toFixed(2)} <Text style={styles.heroUnit}>/ {dailyGoalKm} KM</Text>
              </Text>
            </View>
            <CircularProgress
              progress={goalProgress}
              size={90}
              strokeWidth={8}
              color={COLORS.primary}
              centerText={`${Math.round(goalProgress * 100)}%`}
              centerSubtext="GOAL"
            />
          </View>

          {/* Quick Metrics Strip */}
          <View style={styles.heroMetricsStrip}>
            <View style={styles.stripItem}>
              <Footprints size={14} color={COLORS.primary} />
              <Text style={styles.stripValue}>
                {Math.round(todayDistanceKm * 1320 + 2450).toLocaleString()}
              </Text>
              <Text style={styles.stripLabel}>STEPS</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripItem}>
              <Clock size={14} color={COLORS.cyan} />
              <Text style={styles.stripValue}>{todayActiveMin || 18}m</Text>
              <Text style={styles.stripLabel}>ACTIVE MIN</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripItem}>
              <Zap size={14} color={COLORS.coral} />
              <Text style={styles.stripValue}>{todayCalories || 210}</Text>
              <Text style={styles.stripLabel}>KCAL</Text>
            </View>
          </View>

          {/* Big Prominent START JOGGING Button */}
          <View style={styles.heroBtnContainer}>
            <NeonButton
              title="START JOGGING NOW"
              onPress={onStartRun}
              variant="primary"
              size="lg"
              icon={<Play size={20} color="#08090C" fill="#08090C" />}
            />
          </View>
        </GlassCard>

        {/* AI Fitness Coach Recommendation Card */}
        <TouchableOpacity activeOpacity={0.85} onPress={onOpenCoachChat}>
          <GlassCard highlight="cyan" style={styles.coachCard}>
            <View style={styles.coachHeaderRow}>
              <View style={styles.coachAvatarCircle}>
                <Bot size={18} color={COLORS.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.coachLabel}>AI FITNESS COACH INTEL</Text>
                <Text style={styles.coachHeadline}>{coachAdvice.headline}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.cyan} />
            </View>

            <Text style={styles.coachBody}>{coachAdvice.message}</Text>

            {coachAdvice.actionableStep && (
              <View style={styles.coachActionBox}>
                <Sparkles size={13} color={COLORS.primary} />
                <Text style={styles.coachActionText}>{coachAdvice.actionableStep}</Text>
              </View>
            )}

            <View style={styles.coachFooter}>
              <Text style={styles.coachTapPrompt}>TAP TO DISCUSS WITH COACH</Text>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Weekly Distance Cadence Chart */}
        <WeeklyBarChart days={mockWeeklyData} goalKm={profile.weeklyGoalKm} />

        {/* Daily Missions / Quests (Duolingo Gamification Engine) */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>DAILY MISSIONS</Text>
          <Text style={styles.sectionSubtitle}>CLAIM XP REWARDS</Text>
        </View>

        {dailyMissions.map((mission) => {
          const isDone = mission.isCompleted;
          const isClaimed = mission.isClaimed;

          return (
            <GlassCard key={mission.id} style={styles.missionCard}>
              <View style={styles.missionRow}>
                <View
                  style={[
                    styles.missionIconCircle,
                    isDone && { backgroundColor: 'rgba(204, 255, 0, 0.15)', borderColor: COLORS.primary },
                  ]}
                >
                  {isDone ? (
                    <CheckCircle2 size={18} color={COLORS.primary} />
                  ) : (
                    <Zap size={18} color={COLORS.amber} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDesc}>{mission.description}</Text>
                  <View style={styles.missionProgressRow}>
                    <View style={styles.missionProgressBar}>
                      <View
                        style={[
                          styles.missionProgressFill,
                          {
                            width: `${Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100))}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.missionCount}>
                      {mission.currentValue}/{mission.targetValue}
                    </Text>
                  </View>
                </View>

                {isClaimed ? (
                  <View style={styles.claimedBadge}>
                    <Text style={styles.claimedText}>CLAIMED</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => onClaimMission(mission.id)}
                    disabled={!isDone}
                    style={[
                      styles.claimBtn,
                      isDone ? styles.claimBtnActive : styles.claimBtnDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.claimBtnText,
                        isDone && { color: '#08090C' },
                      ]}
                    >
                      +{mission.xpReward} XP
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </GlassCard>
          );
        })}

        {/* Quick Hub Launchers */}
        <View style={styles.quickLaunchGrid}>
          <TouchableOpacity
            style={styles.launchCard}
            activeOpacity={0.8}
            onPress={onOpenRouteExplorer}
          >
            <Footprints size={20} color={COLORS.primary} />
            <Text style={styles.launchTitle}>FIND ROUTES</Text>
            <Text style={styles.launchSub}>Explore trails & loops</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            activeOpacity={0.8}
            onPress={onOpenRecovery}
          >
            <ActivityIcon size={20} color={COLORS.cyan} />
            <Text style={styles.launchTitle}>RECOVERY</Text>
            <Text style={styles.launchSub}>Readiness & warmups</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom space for dock */}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  heroCard: {
    marginBottom: 16,
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroPretitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 34,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  heroUnit: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stripItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  stripDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    height: '80%',
    alignSelf: 'center',
  },
  stripValue: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  stripLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  heroBtnContainer: {
    marginTop: 4,
  },
  coachCard: {
    marginBottom: 16,
  },
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  coachAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  coachLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.cyan,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  coachHeadline: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  coachBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    marginBottom: 10,
  },
  coachActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
    marginBottom: 10,
  },
  coachActionText: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    flex: 1,
  },
  coachFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  coachTapPrompt: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '700',
  },
  missionCard: {
    padding: 14,
    marginBottom: 10,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  missionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.25)',
  },
  missionTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  missionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  missionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  missionProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  missionCount: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  claimBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  claimBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  claimBtnDisabled: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  claimBtnText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  claimedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  claimedText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.success,
    fontWeight: '800',
  },
  quickLaunchGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  launchCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    gap: 4,
  },
  launchTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  launchSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
