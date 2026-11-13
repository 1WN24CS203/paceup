import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { JoggingRoute } from '../../types/routes';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { OpenStreetMapRoute } from '../maps/OpenStreetMapRoute';
import { ElevationChart } from '../maps/ElevationChart';
import { NeonButton } from '../astrix/NeonButton';
import { MetricCard } from '../astrix/MetricCard';
import { X, Play, Heart, ShieldCheck, MapPin } from 'lucide-react-native';

interface RouteDetailModalProps {
  visible: boolean;
  route: JoggingRoute | null;
  onClose: () => void;
  onStartRoute: (route: JoggingRoute) => void;
  onToggleFavorite: (routeId: string) => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  visible,
  route,
  onClose,
  onStartRoute,
  onToggleFavorite,
}) => {
  if (!route) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <X size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.barTitle}>ROUTE DOSSIER</Text>
          <TouchableOpacity
            onPress={() => onToggleFavorite(route.id)}
            style={styles.favBtn}
          >
            <Heart
              size={20}
              color={route.isFavorite ? COLORS.coral : COLORS.textMuted}
              fill={route.isFavorite ? COLORS.coral : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* OpenStreetMap interactive route visualizer */}
          <View style={styles.mapContainer}>
            <OpenStreetMapRoute
              coordinates={route.waypoints}
              height={240}
              interactive={true}
              accentColor={COLORS.primary}
            />
          </View>

          {/* Route Titles */}
          <View style={styles.titleSection}>
            <View style={styles.locationPill}>
              <MapPin size={12} color={COLORS.primary} />
              <Text style={styles.locationText}>{route.locationName.toUpperCase()}</Text>
            </View>
            <Text style={styles.routeTitle}>{route.title}</Text>
            <Text style={styles.routeDesc}>{route.description}</Text>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            <MetricCard
              label="DISTANCE"
              value={route.distanceKm.toFixed(1)}
              unit="KM"
              accentColor={COLORS.primary}
            />
            <MetricCard
              label="EST. TIME"
              value={route.estimatedDurationMin}
              unit="MIN"
              accentColor={COLORS.textPrimary}
            />
            <MetricCard
              label="DIFFICULTY"
              value={route.difficulty.toUpperCase()}
              accentColor={
                route.difficulty === 'easy'
                  ? COLORS.success
                  : route.difficulty === 'hard'
                  ? COLORS.coral
                  : COLORS.amber
              }
            />
          </View>

          {/* Elevation Profile */}
          {route.elevationProfile.length > 0 && (
            <ElevationChart data={route.elevationProfile} />
          )}

          {/* Route Highlights */}
          <View style={styles.highlightsCard}>
            <Text style={styles.sectionHeading}>TERRAIN & AMENITIES</Text>
            <View style={styles.pillsWrap}>
              <View style={styles.surfacePill}>
                <Text style={styles.surfaceText}>Surface: {route.surface.toUpperCase()}</Text>
              </View>
              {route.highlights.map((h, i) => (
                <View key={i} style={styles.featurePill}>
                  <Text style={styles.featureText}>{h}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Safety Notice per prompt */}
          <View style={styles.pedestrianNotice}>
            <ShieldCheck size={14} color={COLORS.cyan} />
            <Text style={styles.noticeText}>
              Prioritizes pedestrian-friendly paths. Always remain observant of live outdoor conditions and crosswalks.
            </Text>
          </View>

          {/* Action Button */}
          <View style={styles.bottomAction}>
            <NeonButton
              title="RUN THIS ROUTE NOW"
              onPress={() => onStartRoute(route)}
              variant="primary"
              size="lg"
              icon={<Play size={18} color="#08090C" fill="#08090C" />}
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
  backBtn: {
    padding: 6,
  },
  barTitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.2,
  },
  favBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mapContainer: {
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  routeTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  routeDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fontFamily.body,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  highlightsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  surfacePill: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  surfaceText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '700',
  },
  featurePill: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textSecondary,
  },
  pedestrianNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    marginVertical: 10,
  },
  noticeText: {
    fontSize: 11,
    color: COLORS.cyan,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    flex: 1,
    lineHeight: 15,
  },
  bottomAction: {
    marginTop: 16,
  },
});

