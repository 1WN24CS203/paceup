import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteElevationPoint } from '../../types/routes';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface ElevationChartProps {
  data: RouteElevationPoint[];
  maxElevation?: number;
  minElevation?: number;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({
  data,
  maxElevation,
  minElevation,
}) => {
  if (!data || data.length === 0) return null;

  const elevations = data.map((d) => d.elevationM);
  const max = maxElevation || Math.max(...elevations, 20);
  const min = minElevation || Math.min(...elevations, 0);
  const range = Math.max(1, max - min);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>ELEVATION PROFILE</Text>
        <Text style={styles.gainText}>
          ▲ {Math.round(max - min)}m Gain • Peak {Math.round(max)}m
        </Text>
      </View>

      <View style={styles.chartArea}>
        {data.map((point, idx) => {
          const heightPercent = Math.max(10, Math.min(100, Math.round(((point.elevationM - min) / range) * 100)));
          return (
            <View key={idx} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${heightPercent}%`,
                    backgroundColor: idx === data.length - 1 ? COLORS.primary : 'rgba(204, 255, 0, 0.45)',
                  },
                ]}
              />
              <Text style={styles.axisLabel}>{point.distanceKm}k</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
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
  gainText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 6,
  },
  axisLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

