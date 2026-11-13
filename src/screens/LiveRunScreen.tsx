import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Activity, LiveTrackingStats, Split, ActivityType } from '../types/activity';
import { UserProfile } from '../types/user';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { gpsTracker } from '../services/gpsTracker';
import { audioCoach } from '../services/audioCoach';
import { gamificationEngine } from '../services/gamificationEngine';
import { OpenStreetMapRoute } from '../components/maps/OpenStreetMapRoute';
import { PulsingStatus } from '../components/astrix/PulsingStatus';
import { RunSummaryModal } from '../components/modals/RunSummaryModal';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Compass,
  Zap,
  Activity as ActivityIcon,
  Navigation,
} from 'lucide-react-native';

interface LiveRunScreenProps {
  profile: UserProfile;
  initialRoute?: any;
  onFinishActivity: (activity: Activity) => void;
  onExit: () => void;
}

export const LiveRunScreen: React.FC<LiveRunScreenProps> = ({
  profile,
  initialRoute,
  onFinishActivity,
  onExit,
}) => {
  const [trackingState, setTrackingState] = useState<'idle' | 'tracking' | 'paused' | 'finished'>('idle');
  const [isSimulateMode, setIsSimulateMode] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('jog');
  const [audioEnabled, setAudioEnabled] = useState(profile.preferences.audioPaceAnnouncements);
  const [stats, setStats] = useState<LiveTrackingStats>({
    durationSec: 0,
    distanceKm: 0,
    currentPaceSecPerKm: 0,
    avgPaceSecPerKm: 0,
    currentSpeedKmh: 0,
    caloriesBurned: 0,
    elevationGainM: 0,
    currentAccuracyM: null,
    currentSplitKm: 0,
    currentSplitSec: 0,
    splits: [],
    coordinates: initialRoute?.waypoints ? [...initialRoute.waypoints] : [],
  });

  const [finishedActivity, setFinishedActivity] = useState<Activity | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    gpsTracker.setUserWeight(profile.weightKg || 70);
    gpsTracker.setActivityType(activityType);
    audioCoach.setEnabled(audioEnabled);
  }, [profile, activityType, audioEnabled]);

  const handleStartRun = async () => {
    const success = await gpsTracker.startTracking(
      {
        onStatsUpdate: (updated) => setStats(updated),
        onSplitCompleted: (split) => {
          if (audioEnabled) audioCoach.announceSplit(split);
        },
        onError: (err) => {
          console.warn('GPS Error:', err);
        },
      },
      isSimulateMode
    );

    if (success) {
      setTrackingState('tracking');
      if (audioEnabled) audioCoach.announceActivityStart(activityType);
    }
  };

  const handlePause = () => {
    gpsTracker.pause();
    setTrackingState('paused');
    if (audioEnabled) audioCoach.announcePause();
  };

  const handleResume = () => {
    gpsTracker.resume();
    setTrackingState('tracking');
    if (audioEnabled) audioCoach.announceResume();
  };

  const handleFinish = () => {
    gpsTracker.stopTracking();
    setTrackingState('finished');

    // Calculate XP
    const { totalXp } = gamificationEngine.calculateActivityXp(
      stats.distanceKm,
      stats.durationSec,
      profile.streakCount,
      true
    );

    const completed: Activity = {
      id: 'act_' + Date.now(),
      userId: profile.id,
      title: initialRoute ? `Run: ${initialRoute.title}` : `Outdoor ${activityType.toUpperCase()} Session`,
      activityType,
      startTime: Date.now() - stats.durationSec * 1000,
      endTime: Date.now(),
      durationSec: stats.durationSec,
      distanceKm: stats.distanceKm,
      avgPaceSecPerKm: stats.avgPaceSecPerKm || 360,
      bestPaceSecPerKm: stats.splits.length > 0 ? Math.min(...stats.splits.map((s) => s.paceSecPerKm)) : stats.avgPaceSecPerKm,
      avgSpeedKmh: stats.currentSpeedKmh || (stats.distanceKm > 0 ? Number(((stats.distanceKm / (stats.durationSec / 3600))).toFixed(1)) : 0),
      caloriesBurned: stats.caloriesBurned || Math.round(stats.distanceKm * 65),
      elevationGainM: stats.elevationGainM,
      coordinates: stats.coordinates,
      splits: stats.splits,
      visibility: profile.preferences.shareToFeedByDefault ? 'public' : 'private',
      xpEarned: totalXp,
      syncStatus: 'local',
      createdAt: new Date().toISOString(),
    };

    if (audioEnabled) {
      audioCoach.announceFinish(completed.distanceKm, completed.durationSec, completed.avgPaceSecPerKm);
    }

    setFinishedActivity(completed);
    setShowSummaryModal(true);
  };

  const handleDiscard = () => {
    gpsTracker.stopTracking();
    setTrackingState('idle');
    setShowSummaryModal(false);
    setFinishedActivity(null);
    onExit();
  };

  const handleSaveActivity = (saved: Activity) => {
    setShowSummaryModal(false);
    onFinishActivity(saved);
  };

  const formatPace = (paceSec: number) => {
    if (paceSec <= 0) return '--:--';
    const m = Math.floor(paceSec / 60);
    const s = paceSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={styles.container}>
      {/* Top Telemetry Header */}
      <View style={styles.topHud}>
        <PulsingStatus
          label={
            trackingState === 'tracking'
              ? isSimulateMode
                ? 'SIMULATION RUN ACTIVE'
                : `GPS LOCKED • ±${stats.currentAccuracyM || 3}M`
              : trackingState === 'paused'
              ? 'SESSION PAUSED'
              : 'GPS SENSORS PRIMED'
          }
          status={
            trackingState === 'tracking'
              ? 'active'
              : trackingState === 'paused'
              ? 'paused'
              : 'ready'
          }
        />

        <View style={styles.headerRightActions}>
          {/* Simulation Toggle */}
          {trackingState === 'idle' && (
            <TouchableOpacity
              onPress={() => setIsSimulateMode(!isSimulateMode)}
              style={[
                styles.modePill,
                isSimulateMode && styles.modePillActive,
              ]}
            >
              <Navigation size={12} color={isSimulateMode ? '#08090C' : COLORS.textMuted} />
              <Text
                style={[
                  styles.modePillText,
                  isSimulateMode && { color: '#08090C' },
                ]}
              >
                {isSimulateMode ? 'DEMO SIM ON' : 'SIM OFF'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Audio toggle */}
          <TouchableOpacity
            onPress={() => setAudioEnabled(!audioEnabled)}
            style={styles.iconBtn}
          >
            {audioEnabled ? (
              <Volume2 size={18} color={COLORS.primary} />
            ) : (
              <VolumeX size={18} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive OpenStreetMap Route View */}
      <View style={styles.mapContainer}>
        <OpenStreetMapRoute
          coordinates={stats.coordinates}
          livePoint={stats.coordinates[stats.coordinates.length - 1]}
          height={280}
          interactive={true}
          accentColor={COLORS.primary}
        />

        {/* Floating Split km pill */}
        {trackingState === 'tracking' && (
          <View style={styles.floatingSplitPill}>
            <Text style={styles.splitKmText}>
              KM {(stats.distanceKm + 0.01).toFixed(0)} IN PROGRESS
            </Text>
            <Text style={styles.splitSubText}>
              {stats.currentSplitKm.toFixed(2)} km • {formatTime(stats.currentSplitSec)}
            </Text>
          </View>
        )}
      </View>

      {/* High-Voltage Astrix Running HUD */}
      <View style={styles.hudPanel}>
        {/* Main Distance Readout */}
        <View style={styles.primaryMetric}>
          <Text style={styles.primaryValue}>{stats.distanceKm.toFixed(2)}</Text>
          <Text style={styles.primaryUnit}>KILOMETERS</Text>
        </View>

        {/* Grid of Key Performance Indicators */}
        <View style={styles.telemetryGrid}>
          {/* Duration */}
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>TIME</Text>
            <Text style={styles.cellValue}>{formatTime(stats.durationSec)}</Text>
          </View>

          {/* Current Pace */}
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>CURRENT PACE</Text>
            <Text style={[styles.cellValue, { color: COLORS.primary }]}>
              {formatPace(stats.currentPaceSecPerKm)}
            </Text>
            <Text style={styles.cellSub}>/km</Text>
          </View>

          {/* Average Pace */}
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>AVG PACE</Text>
            <Text style={[styles.cellValue, { color: COLORS.cyan }]}>
              {formatPace(stats.avgPaceSecPerKm)}
            </Text>
            <Text style={styles.cellSub}>/km</Text>
          </View>

          {/* Calories */}
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>CALORIES</Text>
            <Text style={[styles.cellValue, { color: COLORS.coral }]}>
              {stats.caloriesBurned}
            </Text>
            <Text style={styles.cellSub}>kcal</Text>
          </View>
        </View>

        {/* Activity Selector (if idle) */}
        {trackingState === 'idle' && (
          <View style={styles.typeSelectorRow}>
            {(['walk', 'jog', 'run', 'interval'] as ActivityType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setActivityType(type)}
                style={[
                  styles.typePill,
                  activityType === type && styles.typePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    activityType === type && styles.typeTextActive,
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Controls Bar */}
        <View style={styles.controlsBar}>
          {trackingState === 'idle' && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStartRun}
              style={styles.bigLaunchBtn}
            >
              <Play size={28} color="#08090C" fill="#08090C" style={{ marginLeft: 4 }} />
              <Text style={styles.bigLaunchText}>LAUNCH SESSION</Text>
            </TouchableOpacity>
          )}

          {trackingState === 'tracking' && (
            <View style={styles.activeControlsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePause}
                style={styles.pauseBtn}
              >
                <Pause size={28} color="#08090C" fill="#08090C" />
                <Text style={styles.btnLabelDark}>PAUSE</Text>
              </TouchableOpacity>
            </View>
          )}

          {trackingState === 'paused' && (
            <View style={styles.pausedControlsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResume}
                style={styles.resumeBtn}
              >
                <Play size={24} color="#08090C" fill="#08090C" />
                <Text style={styles.btnLabelDark}>RESUME</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleFinish}
                style={styles.finishBtn}
              >
                <Square size={20} color={COLORS.primary} fill={COLORS.primary} />
                <Text style={styles.finishBtnText}>FINISH & SAVE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Post-Run Summary Modal */}
      <RunSummaryModal
        visible={showSummaryModal}
        activity={finishedActivity}
        onSave={handleSaveActivity}
        onDiscard={handleDiscard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modePillText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  iconBtn: {
    backgroundColor: COLORS.surfaceElevated,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapContainer: {
    height: 280,
    position: 'relative',
  },
  floatingSplitPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(8, 9, 12, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.35)',
  },
  splitKmText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.1,
  },
  splitSubText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hudPanel: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  primaryMetric: {
    alignItems: 'center',
    marginVertical: 4,
  },
  primaryValue: {
    fontSize: 64,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    color: COLORS.textPrimary,
    letterSpacing: -1,
    lineHeight: 68,
  },
  primaryUnit: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2.5,
    marginTop: -2,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  cellSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    marginTop: 2,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 6,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typePillActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  typeTextActive: {
    color: COLORS.primary,
  },
  controlsBar: {
    marginTop: 10,
    marginBottom: 10,
  },
  bigLaunchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  bigLaunchText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: '#08090C',
    letterSpacing: 1.5,
  },
  activeControlsRow: {
    alignItems: 'center',
  },
  pauseBtn: {
    backgroundColor: COLORS.primary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  btnLabelDark: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: '#08090C',
    marginTop: 2,
  },
  pausedControlsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  resumeBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  finishBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  finishBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
});

