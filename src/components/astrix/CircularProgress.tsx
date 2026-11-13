import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface CircularProgressProps {
  progress: number; // 0.0 to 1.0 (or percentage 0-100)
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  centerText?: string;
  centerSubtext?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 140,
  strokeWidth = 12,
  color = COLORS.primary,
  backgroundColor = COLORS.surfaceSecondary,
  centerText,
  centerSubtext,
}) => {
  const norm = progress > 1 ? Math.min(100, progress) / 100 : Math.min(1, Math.max(0, progress));
  const percent = Math.round(norm * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background ring placeholder */}
      <View
        style={[
          styles.ringBase,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      {/* Glowing progress accent ring */}
      <View
        style={[
          styles.ringBase,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderLeftColor: norm > 0.5 ? color : 'transparent',
            borderBottomColor: norm > 0.75 ? color : 'transparent',
            transform: [{ rotate: `${norm * 360}deg` }],
          },
        ]}
      />
      <View style={styles.centerContent}>
        {centerText ? (
          <Text style={[styles.centerTitle, { color }]}>{centerText}</Text>
        ) : (
          <Text style={[styles.centerTitle, { color }]}>{percent}%</Text>
        )}
        {centerSubtext && <Text style={styles.centerSub}>{centerSubtext}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringBase: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  centerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily.heading,
  },
  centerSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    letterSpacing: 1.1,
    marginTop: 2,
  },
});

