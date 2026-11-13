import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface PulsingStatusProps {
  label: string;
  status?: 'active' | 'ready' | 'paused' | 'searching';
}

export const PulsingStatus: React.FC<PulsingStatusProps> = ({
  label,
  status = 'ready',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const dotColor =
    status === 'active'
      ? COLORS.primary
      : status === 'paused'
      ? COLORS.amber
      : status === 'searching'
      ? COLORS.cyan
      : COLORS.primary;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerHalo,
          {
            backgroundColor: dotColor,
            opacity: pulseAnim,
          },
        ]}
      />
      <View style={[styles.innerDot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 19, 24, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outerHalo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    left: 8,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    marginLeft: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textPrimary,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});

