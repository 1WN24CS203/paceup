import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'giant';
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'ghost':
        return styles.ghostBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'danger':
        return styles.dangerText;
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'md':
        return styles.sizeMd;
      case 'lg':
        return styles.sizeLg;
      case 'giant':
        return styles.sizeGiant;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#08090C' : COLORS.primary} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title.toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  baseText: {
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryText: {
    color: '#08090C',
  },
  secondaryBtn: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  dangerText: {
    color: COLORS.danger,
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: COLORS.textSecondary,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  sizeGiant: {
    paddingVertical: 20,
    paddingHorizontal: 36,
    borderRadius: 20,
  },
  disabled: {
    opacity: 0.4,
  },
});

