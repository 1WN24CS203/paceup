import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  highlight?: 'lime' | 'cyan' | 'coral' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  highlight = 'none',
}) => {
  const getBorderColor = () => {
    switch (highlight) {
      case 'lime':
        return 'rgba(204, 255, 0, 0.35)';
      case 'cyan':
        return 'rgba(0, 240, 255, 0.35)';
      case 'coral':
        return 'rgba(255, 51, 102, 0.35)';
      default:
        return COLORS.border;
    }
  };

  return (
    <View style={[styles.card, { borderColor: getBorderColor() }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
});

