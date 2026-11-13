import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  accentColor?: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  accentColor = COLORS.primary,
  sublabel,
  icon,
}) => {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 140,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  iconContainer: {
    opacity: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily.body,
  },
});

