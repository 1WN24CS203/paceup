import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { JoggingRoute } from '../types/routes';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from '../components/astrix/GlassCard';
import { OpenStreetMapRoute } from '../components/maps/OpenStreetMapRoute';
import { RouteDetailModal } from '../components/modals/RouteDetailModal';
import { NeonButton } from '../components/astrix/NeonButton';
import {
  Compass,
  MapPin,
  Clock,
  Heart,
  Filter,
  Plus,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react-native';

interface ExploreScreenProps {
  routes: JoggingRoute[];
  onSelectRouteToRun: (route: JoggingRoute) => void;
  onToggleFavorite: (routeId: string) => void;
  onCreateCustomRoute: (route: JoggingRoute) => void;
}

type DistanceFilter = 'all' | '1-2' | '3-5' | '5-10' | '10+';

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  routes,
  onSelectRouteToRun,
  onToggleFavorite,
  onCreateCustomRoute,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<DistanceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalRoute, setActiveModalRoute] = useState<JoggingRoute | null>(null);
  const [showCustomCreator, setShowCustomCreator] = useState(false);

  // Custom route state
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customKm, setCustomKm] = useState('3.5');

  // Filter logic
  const filteredRoutes = routes.filter((r) => {
    // Distance filter
    if (selectedFilter === '1-2' && (r.distanceKm < 1 || r.distanceKm > 2)) return false;
    if (selectedFilter === '3-5' && (r.distanceKm < 2.5 || r.distanceKm > 5.2)) return false;
    if (selectedFilter === '5-10' && (r.distanceKm < 5 || r.distanceKm > 10)) return false;
    if (selectedFilter === '10+' && r.distanceKm < 10) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.locationName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveCustomRoute = () => {
    if (!customTitle.trim()) return;
    const kmNum = parseFloat(customKm) || 3.0;

    const newRoute: JoggingRoute = {
      id: 'custom_' + Date.now(),
      title: customTitle.trim(),
      description: customDesc.trim() || 'Custom user jog loop created on PACEUP.',
      locationName: 'My Custom Circuit',
      distanceKm: kmNum,
      estimatedDurationMin: Math.round(kmNum * 6.5),
      elevationGainM: 18,
      difficulty: kmNum > 6 ? 'hard' : kmNum > 3 ? 'moderate' : 'easy',
      surface: 'paved',
      rating: 5.0,
      runCount: 1,
      creatorName: 'You',
      isCurated: false,
      isFavorite: true,
      waypoints: [
        { latitude: 37.7749, longitude: -122.4194, timestamp: 0 },
        { latitude: 37.7770, longitude: -122.4220, timestamp: 0 },
        { latitude: 37.7800, longitude: -122.4200, timestamp: 0 },
        { latitude: 37.7780, longitude: -122.4170, timestamp: 0 },
        { latitude: 37.7749, longitude: -122.4194, timestamp: 0 },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 10 },
        { distanceKm: kmNum / 2, elevationM: 25 },
        { distanceKm: kmNum, elevationM: 10 },
      ],
      highlights: ['Custom Waypoints', 'User Circuit'],
    };

    onCreateCustomRoute(newRoute);
    setShowCustomCreator(false);
    setCustomTitle('');
    setCustomDesc('');
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>EXPLORE ROUTES</Text>
            <Text style={styles.subtitle}>PEDESTRIAN TRAILS & CIRCUITS</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCustomCreator(!showCustomCreator)}
            style={styles.addRouteBtn}
          >
            <Plus size={16} color="#08090C" />
            <Text style={styles.addRouteText}>CUSTOM</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by park, waterfront, or name..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
        />

        {/* Distance Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { key: 'all', label: 'ALL ROUTES' },
            { key: '1-2', label: '1–2 KM' },
            { key: '3-5', label: '3–5 KM' },
            { key: '5-10', label: '5–10 KM' },
            { key: '10+', label: '> 10 KM' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setSelectedFilter(chip.key as DistanceFilter)}
              style={[
                styles.chip,
                selectedFilter === chip.key && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedFilter === chip.key && styles.chipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Custom Route Creator Form (if opened) */}
        {showCustomCreator && (
          <GlassCard highlight="lime" style={styles.creatorCard}>
            <Text style={styles.creatorHeading}>CREATE CUSTOM RUNNING CIRCUIT</Text>
            <TextInput
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="e.g. Morning Riverfront 4K Loop"
              placeholderTextColor={COLORS.textMuted}
              style={styles.creatorInput}
            />
            <TextInput
              value={customDesc}
              onChangeText={setCustomDesc}
              placeholder="Description & landmarks..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.creatorInput}
            />
            <View style={styles.kmInputRow}>
              <Text style={styles.kmLabel}>DISTANCE (KM):</Text>
              <TextInput
                value={customKm}
                onChangeText={setCustomKm}
                keyboardType="numeric"
                style={styles.kmInput}
              />
            </View>
            <View style={styles.creatorBtns}>
              <TouchableOpacity
                onPress={() => setShowCustomCreator(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <NeonButton
                title="SAVE ROUTE"
                onPress={handleSaveCustomRoute}
                variant="primary"
                size="sm"
              />
            </View>
          </GlassCard>
        )}

        {/* Route Cards */}
        {filteredRoutes.map((route) => (
          <TouchableOpacity
            key={route.id}
            activeOpacity={0.85}
            onPress={() => setActiveModalRoute(route)}
          >
            <GlassCard style={styles.routeCard}>
              {/* Map Preview Thumbnail */}
              <View style={styles.mapThumb}>
                <OpenStreetMapRoute
                  coordinates={route.waypoints}
                  height={140}
                  interactive={false}
                  accentColor={COLORS.primary}
                />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <View style={styles.locBadge}>
                    <MapPin size={11} color={COLORS.primary} />
                    <Text style={styles.locText}>{route.locationName.toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onToggleFavorite(route.id)}
                    style={styles.favIconBtn}
                  >
                    <Heart
                      size={18}
                      color={route.isFavorite ? COLORS.coral : COLORS.textMuted}
                      fill={route.isFavorite ? COLORS.coral : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle}>{route.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {route.description}
                </Text>

                {/* Specs Row */}
                <View style={styles.specsRow}>
                  <View style={styles.spec}>
                    <Text style={styles.specVal}>{route.distanceKm.toFixed(1)} KM</Text>
                    <Text style={styles.specLbl}>DISTANCE</Text>
                  </View>
                  <View style={styles.spec}>
                    <Text style={styles.specVal}>{route.estimatedDurationMin} MIN</Text>
                    <Text style={styles.specLbl}>EST. TIME</Text>
                  </View>
                  <View style={styles.spec}>
                    <Text style={styles.specVal}>▲ {route.elevationGainM}m</Text>
                    <Text style={styles.specLbl}>ELEVATION</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onSelectRouteToRun(route)}
                    style={styles.quickRunBtn}
                  >
                    <Play size={14} color="#08090C" fill="#08090C" />
                    <Text style={styles.quickRunText}>RUN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Route Detail Modal */}
      <RouteDetailModal
        visible={!!activeModalRoute}
        route={activeModalRoute}
        onClose={() => setActiveModalRoute(null)}
        onStartRoute={(rt) => {
          setActiveModalRoute(null);
          onSelectRouteToRun(rt);
        }}
        onToggleFavorite={onToggleFavorite}
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
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.background,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  subtitle: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  addRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addRouteText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: '#08090C',
  },
  searchInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  creatorCard: {
    padding: 16,
    marginBottom: 16,
  },
  creatorHeading: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  creatorInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 8,
  },
  kmInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  kmLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  kmInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: COLORS.textPrimary,
    fontSize: 13,
    width: 60,
  },
  creatorBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    padding: 8,
  },
  cancelText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  routeCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 14,
  },
  mapThumb: {
    height: 140,
    backgroundColor: '#08090C',
  },
  cardBody: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  locBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  favIconBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 6,
    lineHeight: 16,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 4,
  },
  spec: {
    alignItems: 'flex-start',
  },
  specVal: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  specLbl: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  quickRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  quickRunText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: '#08090C',
  },
});
