import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { UserProfile } from '../types/user';
import { Activity } from '../types/activity';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from '../components/astrix/GlassCard';
import { MetricCard } from '../components/astrix/MetricCard';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';
import {
  TrendingUp,
  Award,
  Calendar,
  Flame,
  Zap,
  Clock,
  Footprints,
  Activity as ActivityIcon,
  Crown,
} from 'lucide-react-native';

interface ProgressScreenProps {
  profile: UserProfile;
  activities: Activity[];
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'lifetime';

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  activities,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('weekly');

  const totalDistance = activities.reduce((sum, a) => sum + a.distanceKm, 0);
  const totalDuration = activities.reduce((sum, a) => sum + a.durationSec, 0);
  const totalCalories = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const avgPace = totalDistance > 0 ? Math.round(totalDuration / totalDistance) : 360;

  // Personal Records (PRs)
  const fastest1k = activities.length > 0 ? Math.min(...activities.map((a) => a.bestPaceSecPerKm || 300)) : 310;
  const longestRun = activities.length > 0 ? Math.max(...activities.map((a) => a.distanceKm)) : 5.25;

  const formatPace = (paceSec: number) => {
    const min = Math.floor(paceSec / 60);
    const sec = paceSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const formatHours = (sec: number) => {
    return (sec / 3600).toFixed(1);
  };

  // Mock weekly breakdown
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyBars = weekDays.map((d, i) => ({
    dayLabel: d,
    km: i === 1 ? 5.2 : i === 3 ? 2.8 : i === 5 ? 4.5 : i === 6 ? 3.0 : 0,
    isToday: i === 6,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ANALYTICS & METRICS</Text>
          <Text style={styles.subtitle}>SPORTS TELEMETRY ENGINE</Text>
        </View>

        {/* Timeframe Switcher */}
        <View style={styles.timeframeRow}>
          {(['daily', 'weekly', 'monthly', 'lifetime'] as Timeframe[]).map((tf) => (
            <TouchableOpacity
              key={tf}
              onPress={() => setSelectedTimeframe(tf)}
              style={[
                styles.tfBtn,
                selectedTimeframe === tf && styles.tfBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tfBtnText,
                  selectedTimeframe === tf && styles.tfBtnTextActive,
                ]}
              >
                {tf.slice(0, 3).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Core Mileage & Cadence Chart */}
        <WeeklyBarChart days={weeklyBars} goalKm={profile.weeklyGoalKm} />

        {/* Key Metrics Grid */}
        <View style={styles.metricGrid}>
          <MetricCard
            label="TOTAL DISTANCE"
            value={
              selectedTimeframe === 'lifetime'
                ? profile.lifetimeDistanceKm.toFixed(1)
                : selectedTimeframe === 'weekly'
                ? '15.5'
                : selectedTimeframe === 'monthly'
                ? '58.2'
                : '3.4'
            }
            unit="KM"
            accentColor={COLORS.primary}
            sublabel="+18% vs prev period"
          />
          <MetricCard
            label="TOTAL TIME"
            value={
              selectedTimeframe === 'lifetime'
                ? `${formatHours(profile.lifetimeDurationSec)}`
                : selectedTimeframe === 'weekly'
                ? '1.8'
                : '6.4'
            }
            unit="HOURS"
            accentColor={COLORS.textPrimary}
          />
        </View>

        <View style={[styles.metricGrid, { marginTop: 10 }]}>
          <MetricCard
            label="AVERAGE PACE"
            value={formatPace(avgPace)}
            unit="/KM"
            accentColor={COLORS.cyan}
          />
          <MetricCard
            label="ACTIVITIES"
            value={selectedTimeframe === 'lifetime' ? profile.lifetimeRuns : activities.length}
            accentColor={COLORS.coral}
          />
        </View>

        {/* Personal Bests / Hall of Fame Records */}
        <GlassCard highlight="lime" style={styles.prCard}>
          <View style={styles.prHeader}>
            <Crown size={16} color={COLORS.primary} />
            <Text style={styles.prTitle}>PERSONAL RECORDS (PR)</Text>
          </View>

          <View style={styles.prRows}>
            <View style={styles.prRow}>
              <View>
                <Text style={styles.prLabel}>FASTEST 1 KM</Text>
                <Text style={styles.prDate}>Lake Loop Surge</Text>
              </View>
              <Text style={styles.prValue}>{formatPace(fastest1k)} /km</Text>
            </View>

            <View style={styles.prDivider} />

            <View style={styles.prRow}>
              <View>
                <Text style={styles.prLabel}>LONGEST DISTANCE</Text>
                <Text style={styles.prDate}>Continuous Outdoor Jog</Text>
              </View>
              <Text style={styles.prValue}>{longestRun.toFixed(2)} KM</Text>
            </View>

            <View style={styles.prDivider} />

            <View style={styles.prRow}>
              <View>
                <Text style={styles.prLabel}>LONGEST STREAK</Text>
                <Text style={styles.prDate}>Consistent Habit Building</Text>
              </View>
              <Text style={[styles.prValue, { color: COLORS.coral }]}>
                {profile.streakCount} DAYS 🔥
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Monthly Activity Distribution */}
        <GlassCard style={styles.distCard}>
          <Text style={styles.sectionHeader}>ACTIVITY DISTRIBUTION</Text>
          <View style={styles.distBarRow}>
            <View style={[styles.distSegment, { flex: 6, backgroundColor: COLORS.primary }]} />
            <View style={[styles.distSegment, { flex: 2.5, backgroundColor: COLORS.cyan }]} />
            <View style={[styles.distSegment, { flex: 1.5, backgroundColor: COLORS.coral }]} />
          </View>

          <View style={styles.distLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>JOGGING (60%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cyan }]} />
              <Text style={styles.legendText}>INTERVALS (25%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.coral }]} />
              <Text style={styles.legendText}>WALKS (15%)</Text>
            </View>
          </View>
        </GlassCard>

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
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
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
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 7,
  },
  tfBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tfBtnText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  tfBtnTextActive: {
    color: '#08090C',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  prCard: {
    marginTop: 14,
    padding: 18,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  prTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  prRows: {
    gap: 10,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  prDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  prValue: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
  },
  prDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  distCard: {
    marginTop: 14,
    padding: 18,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  distBarRow: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  distSegment: {
    height: '100%',
  },
  distLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
  },
});

