import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export interface DayMetric {
  dayLabel: string;
  km: number;
  isToday?: boolean;
}

interface WeeklyBarChartProps {
  days: DayMetric[];
  goalKm?: number;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  days,
  goalKm = 20,
}) => {
  const maxKm = Math.max(...days.map((d) => d.km), 6);
  const totalKm = days.reduce((sum, d) => sum + d.km, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>WEEKLY DISTANCE CADENCE</Text>
          <Text style={styles.subtitle}>
            {totalKm.toFixed(1)} KM / {goalKm} KM Goal ({Math.round((totalKm / goalKm) * 100)}%)
          </Text>
        </View>
        <View style={styles.trendPill}>
          <Text style={styles.trendText}>+14% vs Last Wk</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {days.map((day, idx) => {
          const heightPercent = Math.max(6, Math.min(100, Math.round((day.km / maxKm) * 100)));
          const isToday = day.isToday;

          return (
            <View key={idx} style={styles.col}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isToday
                        ? COLORS.primary
                        : day.km > 0
                        ? 'rgba(204, 255, 0, 0.45)'
                        : 'rgba(255, 255, 255, 0.06)',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && { color: COLORS.primary, fontWeight: '900' },
                ]}
              >
                {day.dayLabel}
              </Text>
              <Text style={styles.kmVal}>
                {day.km > 0 ? `${day.km.toFixed(1)}` : '-'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  trendPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  trendText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '700',
    color: COLORS.success,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 75,
    width: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: '700',
  },
  kmVal: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

