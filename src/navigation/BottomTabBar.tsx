import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import {
  Home,
  Compass,
  Play,
  BarChart3,
  Users,
  User,
  HeartPulse,
} from 'lucide-react-native';

export type TabKey = 'home' | 'explore' | 'run' | 'progress' | 'community' | 'recovery' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isRunActive?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  isRunActive = false,
}) => {
  return (
    <View style={styles.dockContainer}>
      <View style={styles.bar}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('home')}
          style={styles.tabItem}
        >
          <Home
            size={20}
            color={activeTab === 'home' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && { color: COLORS.primary, fontWeight: '800' },
            ]}
          >
            HOME
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Explore */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('explore')}
          style={styles.tabItem}
        >
          <Compass
            size={20}
            color={activeTab === 'explore' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'explore' && { color: COLORS.primary, fontWeight: '800' },
            ]}
          >
            EXPLORE
          </Text>
        </TouchableOpacity>

        {/* Center Prominent START RUN Action Button */}
        <View style={styles.centerActionWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelectTab('run')}
            style={[
              styles.runActionBtn,
              isRunActive && styles.runActionBtnActive,
            ]}
          >
            <Play
              size={26}
              color="#08090C"
              fill="#08090C"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
          <Text style={styles.runActionLabel}>
            {isRunActive ? 'LIVE' : 'START'}
          </Text>
        </View>

        {/* Tab 3: Progress Analytics */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('progress')}
          style={styles.tabItem}
        >
          <BarChart3
            size={20}
            color={activeTab === 'progress' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'progress' && { color: COLORS.primary, fontWeight: '800' },
            ]}
          >
            METRICS
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Community */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('community')}
          style={styles.tabItem}
        >
          <Users
            size={20}
            color={activeTab === 'community' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'community' && { color: COLORS.primary, fontWeight: '800' },
            ]}
          >
            SOCIETY
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profile & Recovery */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('profile')}
          style={styles.tabItem}
        >
          <User
            size={20}
            color={activeTab === 'profile' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && { color: COLORS.primary, fontWeight: '800' },
            ]}
          >
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 19, 24, 0.94)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    maxWidth: 540,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 54,
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1.0,
    marginTop: 3,
  },
  centerActionWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
  },
  runActionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#08090C',
  },
  runActionBtnActive: {
    backgroundColor: COLORS.coral,
    shadowColor: COLORS.coral,
  },
  runActionLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});

