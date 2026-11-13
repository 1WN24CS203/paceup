import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Flame, Trophy, Volume2, VolumeX } from 'lucide-react-native';

interface AstrixHeaderProps {
  streakCount: number;
  level: number;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onPressProfile?: () => void;
}

export const AstrixHeader: React.FC<AstrixHeaderProps> = ({
  streakCount,
  level,
  audioEnabled = true,
  onToggleAudio,
  onPressProfile,
}) => {
  return (
    <View style={styles.header}>
      {/* Brand & Tagline */}
      <View style={styles.brandContainer}>
        <Image
          source={require('../../../assets/paceup-logo.png')}
          style={styles.logoBadge}
          resizeMode="cover"
        />
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>PACE</Text>
            <Text style={styles.brandAccent}>UP</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.tagline}>EVERY STEP COUNTS</Text>
        </View>
      </View>

      {/* Live HUD Badges */}
      <View style={styles.badgesRow}>
        {/* Streak Flame Pill */}
        <View style={styles.streakPill}>
          <Flame size={14} color={COLORS.coral} />
          <Text style={styles.streakText}>{streakCount}</Text>
        </View>

        {/* Level Pill */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressProfile}
          style={styles.levelPill}
        >
          <Trophy size={13} color={COLORS.primary} />
          <Text style={styles.levelText}>L{level}</Text>
        </TouchableOpacity>

        {/* Audio Coach Mute/Unmute */}
        {onToggleAudio && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleAudio}
            style={styles.audioBtn}
          >
            {audioEnabled ? (
              <Volume2 size={16} color={COLORS.primary} />
            ) : (
              <VolumeX size={16} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.4)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandAccent: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  versionBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  versionText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: -2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 51, 102, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.3)',
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.coral,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    gap: 4,
  },
  levelText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.primary,
  },
  audioBtn: {
    backgroundColor: COLORS.surfaceElevated,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

