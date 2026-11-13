import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Activity, Split } from '../../types/activity';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { OpenStreetMapRoute } from '../maps/OpenStreetMapRoute';
import { PaceCurveChart } from '../charts/PaceCurveChart';
import { NeonButton } from '../astrix/NeonButton';
import { MetricCard } from '../astrix/MetricCard';
import { Trophy, Share2, Check, Lock, Globe, Users } from 'lucide-react-native';

interface RunSummaryModalProps {
  visible: boolean;
  activity: Activity | null;
  onSave: (activity: Activity) => void;
  onDiscard: () => void;
}

export const RunSummaryModal: React.FC<RunSummaryModalProps> = ({
  visible,
  activity,
  onSave,
  onDiscard,
}) => {
  if (!activity) return null;

  const [title, setTitle] = useState(activity.title || 'Tempo Stride Workout');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const formatPace = (paceSec: number) => {
    const min = Math.floor(paceSec / 60);
    const sec = paceSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSave = () => {
    onSave({
      ...activity,
      title,
      notes,
      visibility,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onDiscard}>
            <Text style={styles.discardText}>DISCARD</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>SESSION DEBRIEF</Text>
          <View style={styles.xpPill}>
            <Trophy size={13} color={COLORS.primary} />
            <Text style={styles.xpText}>+{activity.xpEarned} XP</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Title Editor */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            placeholder="Name your workout..."
            placeholderTextColor={COLORS.textMuted}
          />

          {/* Interactive OSM Route Map */}
          <View style={styles.mapWrapper}>
            <OpenStreetMapRoute
              coordinates={activity.coordinates}
              height={230}
              interactive={true}
              accentColor={COLORS.primary}
            />
          </View>

          {/* Primary Telemetry Grid */}
          <View style={styles.statsGrid}>
            <MetricCard
              label="DISTANCE"
              value={activity.distanceKm.toFixed(2)}
              unit="KM"
              accentColor={COLORS.primary}
            />
            <MetricCard
              label="DURATION"
              value={formatTime(activity.durationSec)}
              accentColor={COLORS.textPrimary}
            />
          </View>

          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <MetricCard
              label="AVG PACE"
              value={formatPace(activity.avgPaceSecPerKm)}
              unit="/KM"
              accentColor={COLORS.cyan}
            />
            <MetricCard
              label="CALORIES"
              value={activity.caloriesBurned}
              unit="KCAL"
              accentColor={COLORS.coral}
            />
            <MetricCard
              label="ELEV GAIN"
              value={`+${activity.elevationGainM}`}
              unit="M"
              accentColor={COLORS.amber}
            />
          </View>

          {/* Kilometer Splits Breakdown */}
          {activity.splits.length > 0 && <PaceCurveChart splits={activity.splits} />}

          {/* Notes Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>HOW DID THIS RUN FEEL?</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={styles.notesInput}
              multiline
              numberOfLines={3}
              placeholder="Felt smooth on the uphill, kept cadence at 170 spm..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Visibility Controls */}
          <View style={styles.visibilityCard}>
            <Text style={styles.inputLabel}>ACTIVITY PRIVACY</Text>
            <View style={styles.visButtonsRow}>
              <TouchableOpacity
                onPress={() => setVisibility('public')}
                style={[
                  styles.visBtn,
                  visibility === 'public' && styles.visBtnActive,
                ]}
              >
                <Globe size={14} color={visibility === 'public' ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.visBtnText, visibility === 'public' && { color: COLORS.primary }]}>
                  PUBLIC
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVisibility('friends')}
                style={[
                  styles.visBtn,
                  visibility === 'friends' && styles.visBtnActive,
                ]}
              >
                <Users size={14} color={visibility === 'friends' ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.visBtnText, visibility === 'friends' && { color: COLORS.primary }]}>
                  FRIENDS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVisibility('private')}
                style={[
                  styles.visBtn,
                  visibility === 'private' && styles.visBtnActive,
                ]}
              >
                <Lock size={14} color={visibility === 'private' ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.visBtnText, visibility === 'private' && { color: COLORS.primary }]}>
                  PRIVATE
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Action */}
          <View style={styles.actions}>
            <NeonButton
              title="SAVE & LEVEL UP"
              onPress={handleSave}
              variant="primary"
              size="lg"
              icon={<Check size={18} color="#08090C" />}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  discardText: {
    color: COLORS.danger,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontSize: 12,
    fontWeight: '800',
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '900',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 16,
  },
  mapWrapper: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  notesInput: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  visibilityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 14,
  },
  visButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  visBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  visBtnText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  actions: {
    marginTop: 24,
  },
});

