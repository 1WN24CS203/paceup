import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Split } from '../../types/activity';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface PaceCurveChartProps {
  splits: Split[];
}

export const PaceCurveChart: React.FC<PaceCurveChartProps> = ({ splits }) => {
  if (!splits || splits.length === 0) return null;

  const paces = splits.map((s) => s.paceSecPerKm);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const range = Math.max(1, maxPace - minPace);

  const formatPace = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KILOMETER SPLIT CURVE</Text>
        <Text style={styles.bestPace}>Best {formatPace(minPace)} /km</Text>
      </View>

      <View style={styles.splitsList}>
        {splits.map((s) => {
          const isBest = s.paceSecPerKm === minPace;
          const barWidthPercent = Math.max(30, Math.min(100, 100 - ((s.paceSecPerKm - minPace) / range) * 60));

          return (
            <View key={s.kilometer} style={styles.splitRow}>
              <View style={styles.kmBadge}>
                <Text style={styles.kmText}>KM {s.kilometer}</Text>
              </View>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${barWidthPercent}%`,
                      backgroundColor: isBest ? COLORS.primary : COLORS.cyan,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.paceText,
                  isBest && { color: COLORS.primary, fontWeight: '900' },
                ]}
              >
                {formatPace(s.paceSecPerKm)}
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bestPace: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  splitsList: {
    gap: 8,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kmBadge: {
    width: 48,
  },
  kmText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  paceText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textPrimary,
    fontWeight: '700',
    width: 48,
    textAlign: 'right',
  },
});

