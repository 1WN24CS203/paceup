import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { UserProfile } from '../types/user';
import { Achievement, LevelTier } from '../types/gamification';
import { Activity } from '../types/activity';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from '../components/astrix/GlassCard';
import { NeonButton } from '../components/astrix/NeonButton';
import { CircularProgress } from '../components/astrix/CircularProgress';
import { SupabaseConfigModal } from '../components/modals/SupabaseConfigModal';
import { gamificationEngine } from '../services/gamificationEngine';
import { notificationService, ReminderSchedule } from '../services/notificationService';
import { storage } from '../services/storage';
import {
  Trophy,
  Shield,
  Download,
  Cloud,
  Flame,
  Bell,
  Lock,
  Globe,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

interface ProfileScreenProps {
  profile: UserProfile;
  achievements: Achievement[];
  activities: Activity[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenRecoveryHub: () => void;
  onResetData: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  achievements,
  activities,
  onUpdateProfile,
  onOpenRecoveryHub,
  onResetData,
}) => {
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [reminders, setReminders] = useState<ReminderSchedule[]>(notificationService.getReminders());

  const levelInfo = gamificationEngine.getLevelInfo(profile.xp);

  const handleToggleReminder = (id: string) => {
    const updated = notificationService.toggleReminder(id);
    setReminders(updated);
  };

  const handleTogglePrivacy = (isPrivate: boolean) => {
    onUpdateProfile({
      ...profile,
      isProfilePrivate: isPrivate,
    });
  };

  const handleExportData = async () => {
    const jsonStr = await storage.exportUserData();
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PACEUP_Export_${profile.username}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Data Exported', 'Activity history and personal telemetry downloaded successfully.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ATHLETE PROFILE</Text>
        <TouchableOpacity onPress={() => setShowCloudModal(true)} style={styles.cloudBtn}>
          <Cloud size={16} color={COLORS.primary} />
          <Text style={styles.cloudBtnText}>CLOUD SYNC</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Identity Card */}
        <GlassCard highlight="lime" style={styles.identityCard}>
          <View style={styles.profileRow}>
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{profile.displayName}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>LVL {profile.level}</Text>
                </View>
              </View>
              <Text style={styles.handle}>@{profile.username}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          </View>

          {/* Gamification Level Progress Ladder */}
          <View style={styles.levelLadderContainer}>
            <View style={styles.ladderHeader}>
              <Text style={styles.ladderTitle}>
                {levelInfo.currentLevel.badge} {levelInfo.currentLevel.title.toUpperCase()}
              </Text>
              <Text style={styles.ladderXp}>
                {profile.xp} / {levelInfo.nextLevel ? levelInfo.nextLevel.minXp : 'MAX'} XP
              </Text>
            </View>

            <View style={styles.ladderTrack}>
              <View
                style={[
                  styles.ladderFill,
                  { width: `${levelInfo.progressPercent}%` },
                ]}
              />
            </View>

            {levelInfo.nextLevel && (
              <Text style={styles.nextLevelPrompt}>
                +{levelInfo.xpToNextLevel} XP until {levelInfo.nextLevel.title}
              </Text>
            )}
          </View>
        </GlassCard>

        {/* Lifetime Telemetry Highlights */}
        <View style={styles.lifetimeGrid}>
          <View style={styles.lifetimeBox}>
            <Text style={styles.ltValue}>{profile.lifetimeDistanceKm.toFixed(1)}</Text>
            <Text style={styles.ltLabel}>LIFETIME KM</Text>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={styles.ltValue}>{profile.lifetimeRuns}</Text>
            <Text style={styles.ltLabel}>ACTIVITIES</Text>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={[styles.ltValue, { color: COLORS.coral }]}>{profile.streakCount}</Text>
            <Text style={styles.ltLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={[styles.ltValue, { color: COLORS.cyan }]}>
              {(profile.lifetimeDurationSec / 3600).toFixed(1)}
            </Text>
            <Text style={styles.ltLabel}>HOURS ACTIVE</Text>
          </View>
        </View>

        {/* Achievements Showcase (Duolingo Style Trophy Shelf) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS & TROPHIES</Text>
          <Text style={styles.sectionSubtitle}>
            {achievements.filter((a) => a.isUnlocked).length} / {achievements.length} UNLOCKED
          </Text>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map((ach) => (
            <GlassCard
              key={ach.id}
              highlight={ach.isUnlocked ? 'lime' : 'none'}
              style={styles.achCard}
            >
              <View
                style={[
                  styles.achIconCircle,
                  ach.isUnlocked && styles.achIconCircleUnlocked,
                ]}
              >
                <Text style={styles.achBadgeIcon}>{ach.badgeIcon}</Text>
              </View>

              <Text style={styles.achTitle}>{ach.title}</Text>
              <Text style={styles.achDesc} numberOfLines={2}>
                {ach.description}
              </Text>

              {ach.isUnlocked ? (
                <View style={styles.unlockedPill}>
                  <Text style={styles.unlockedText}>UNLOCKED</Text>
                </View>
              ) : (
                <View style={styles.achProgressTrack}>
                  <View
                    style={[
                      styles.achProgressFill,
                      { width: `${Math.round(ach.progress * 100)}%` },
                    ]}
                  />
                </View>
              )}
            </GlassCard>
          ))}
        </View>

        {/* Routine & Reminder Notifications */}
        <GlassCard style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Bell size={18} color={COLORS.primary} />
            <Text style={styles.settingsTitle}>TRAINING REMINDERS</Text>
          </View>

          {reminders.map((r) => (
            <View key={r.id} style={styles.reminderRow}>
              <View>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                <Text style={styles.reminderTime}>{r.time} Daily</Text>
              </View>
              <Switch
                value={r.isEnabled}
                onValueChange={() => handleToggleReminder(r.id)}
                trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.primaryDark }}
                thumbColor={r.isEnabled ? COLORS.primary : '#888'}
              />
            </View>
          ))}
        </GlassCard>

        {/* Privacy & Security Settings */}
        <GlassCard style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Shield size={18} color={COLORS.cyan} />
            <Text style={styles.settingsTitle}>PRIVACY & DATA OWNERSHIP</Text>
          </View>

          <View style={styles.privacyOptionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyLabel}>PRIVATE PROFILE BY DEFAULT</Text>
              <Text style={styles.privacySub}>
                When enabled, your routes and stats are never visible to strangers.
              </Text>
            </View>
            <Switch
              value={profile.isProfilePrivate}
              onValueChange={handleTogglePrivacy}
              trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.cyan }}
              thumbColor={profile.isProfilePrivate ? COLORS.cyan : '#888'}
            />
          </View>

          <View style={styles.divider} />

          {/* Export Data Action */}
          <TouchableOpacity
            onPress={handleExportData}
            style={styles.actionRowBtn}
          >
            <Download size={16} color={COLORS.primary} />
            <Text style={styles.actionRowText}>EXPORT ACTIVITY HISTORY (JSON / GPX)</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Reset Local Data Action */}
          <TouchableOpacity
            onPress={onResetData}
            style={styles.actionRowBtn}
          >
            <Trash2 size={16} color={COLORS.danger} />
            <Text style={[styles.actionRowText, { color: COLORS.danger }]}>
              RESET LOCAL DATA & SESSIONS
            </Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Supabase Cloud Sync Modal */}
      <SupabaseConfigModal
        visible={showCloudModal}
        onClose={() => setShowCloudModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  cloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  cloudBtnText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  identityCard: {
    padding: 18,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  levelBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  levelBadgeText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  handle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  bio: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  levelLadderContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  ladderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ladderTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
  },
  ladderXp: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
  },
  ladderTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ladderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  nextLevelPrompt: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  lifetimeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  lifetimeBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  ltValue: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
  },
  ltLabel: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  achCard: {
    width: '48%',
    padding: 12,
    alignItems: 'center',
    marginBottom: 0,
  },
  achIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  achIconCircleUnlocked: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: 'rgba(204, 255, 0, 0.4)',
  },
  achBadgeIcon: {
    fontSize: 20,
  },
  achTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  achDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 4,
    lineHeight: 13,
  },
  unlockedPill: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    marginTop: 4,
  },
  unlockedText: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  achProgressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  achProgressFill: {
    height: '100%',
    backgroundColor: COLORS.cyan,
  },
  settingsCard: {
    padding: 16,
    marginBottom: 14,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  settingsTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reminderTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.body,
  },
  reminderTime: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  privacyOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  privacySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  actionRowText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
