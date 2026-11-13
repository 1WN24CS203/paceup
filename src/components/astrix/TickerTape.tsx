import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface TickerTapeProps {
  items?: string[];
  speedMs?: number;
  variant?: 'lime' | 'cyan' | 'obsidian';
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  items = [
    'PACEUP // EVERY STEP COUNTS',
    'LEVEL UP YOUR STRIDE',
    'GPS TELEMETRY PRIMED',
    'STREAK: 9 DAYS ACTIVE',
    '100% FREE FOREVER',
    'AI RUNNING COACH ACTIVE',
    'NO PAYWALLS // ZERO ADS',
  ],
  speedMs = 24000,
  variant = 'lime',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: -600,
        duration: speedMs,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    loop.start();
    return () => loop.stop();
  }, [speedMs]);

  const textColor = variant === 'lime' ? COLORS.primary : variant === 'cyan' ? COLORS.cyan : COLORS.textPrimary;
  const borderColor = variant === 'lime' ? 'rgba(204, 255, 0, 0.25)' : 'rgba(0, 240, 255, 0.25)';

  const fullText = items.join('   ✦   ') + '   ✦   ' + items.join('   ✦   ');

  return (
    <View style={[styles.container, { borderColor }]}>
      <Animated.View
        style={[
          styles.row,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        <Text style={[styles.tickerText, { color: textColor }]}>
          {fullText}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 32,
    backgroundColor: '#0D0F14',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 2400,
  },
  tickerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
});

