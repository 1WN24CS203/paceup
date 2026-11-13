import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UserProfile } from './src/types/user';
import { Activity } from './src/types/activity';
import { Achievement, DailyMission } from './src/types/gamification';
import { JoggingRoute } from './src/types/routes';
import { ActivityFeedItem, RunningClub, CommunityChallenge } from './src/types/community';
import { DailyRecoveryLog } from './src/types/recovery';
import { CoachAdvice } from './src/types/coach';

import { storage } from './src/services/storage';
import { aiCoach } from './src/services/aiCoach';
import { gamificationEngine } from './src/services/gamificationEngine';
import { supabaseManager } from './src/services/supabaseClient';
import { COLORS } from './src/constants/theme';
import { INITIAL_USER_PROFILE, INITIAL_DAILY_MISSIONS, COMMUNITY_CHALLENGES } from './src/constants/mockData';

import { BottomTabBar, TabKey } from './src/navigation/BottomTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { LiveRunScreen } from './src/screens/LiveRunScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { RecoveryScreen } from './src/screens/RecoveryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

import { CoachChatModal } from './src/components/modals/CoachChatModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Application Global State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [routes, setRoutes] = useState<JoggingRoute[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(INITIAL_DAILY_MISSIONS);
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [clubs, setClubs] = useState<RunningClub[]>([]);
  const [recoveryLog, setRecoveryLog] = useState<DailyRecoveryLog | null>(null);
  const [coachAdvice, setCoachAdvice] = useState<CoachAdvice | null>(null);

  // Modals & Navigation state
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [selectedRouteForRun, setSelectedRouteForRun] = useState<JoggingRoute | null>(null);
  const [isLiveRunActive, setIsLiveRunActive] = useState(false);

  // Initialize data on boot
  useEffect(() => {
    async function bootstrap() {
      try {
        await storage.init();
        await supabaseManager.init();

        const p = await storage.getProfile();
        const acts = await storage.getActivities();
        const rts = await storage.getAllRoutes();
        const achs = await storage.getAchievements();
        const mss = await storage.getDailyMissions();
        const fd = await storage.getCommunityFeed();
        const clbs = await storage.getClubs();
        const rec = await storage.getRecoveryLog();

        setProfile(p);
        setActivities(acts);
        setRoutes(rts);
        setAchievements(achs);
        setDailyMissions(mss);
        setFeed(fd);
        setClubs(clbs);
        setRecoveryLog(rec);

        const adv = aiCoach.generateDailyAdvice(p, acts, rec);
        setCoachAdvice(adv);
      } catch (e) {
        console.warn('App bootstrap error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  // Complete Onboarding
  const handleCompleteOnboarding = async (formData: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...profile,
      ...formData,
      onboardingCompleted: true,
    };
    await storage.saveProfile(updated);
    setProfile(updated);

    // Generate tailored training plan
    const plan = aiCoach.generatePersonalizedPlan(updated);
    await storage.saveTrainingPlan(plan);
    setActiveTab('home');
  };

  // Activity Completed & Saved
  const handleFinishActivity = async (completedActivity: Activity) => {
    await storage.saveActivity(completedActivity);

    // Update state
    const updatedActivities = [completedActivity, ...activities];
    setActivities(updatedActivities);

    // Re-evaluate achievements
    const { updatedAchievements } = gamificationEngine.evaluateAchievements(
      achievements,
      profile,
      completedActivity
    );
    await storage.saveAchievements(updatedAchievements);
    setAchievements(updatedAchievements);

    // Update missions
    const updatedMissions = gamificationEngine.updateDailyMissions(dailyMissions, completedActivity);
    await storage.saveDailyMissions(updatedMissions);
    setDailyMissions(updatedMissions);

    // Refresh profile metrics
    const updatedProfile = await storage.getProfile();
    setProfile(updatedProfile);

    // Push to community feed if public
    if (completedActivity.visibility === 'public') {
      const newFeedPost: ActivityFeedItem = {
        id: 'post_' + completedActivity.id,
        userId: profile.id,
        userName: profile.displayName,
        userAvatar: profile.avatarUrl,
        userLevel: profile.level,
        activityTitle: completedActivity.title,
        activityType: completedActivity.activityType,
        distanceKm: completedActivity.distanceKm,
        durationSec: completedActivity.durationSec,
        paceMinKm: `${Math.floor(completedActivity.avgPaceSecPerKm / 60)}:${(completedActivity.avgPaceSecPerKm % 60).toString().padStart(2, '0')}`,
        caloriesBurned: completedActivity.caloriesBurned,
        kudosCount: 1,
        hasGivenKudos: false,
        commentsCount: 0,
        comments: [],
        createdAt: 'Just now',
      };
      const newFeed = [newFeedPost, ...feed];
      await storage.saveCommunityFeed(newFeed);
      setFeed(newFeed);
    }

    // Try cloud sync if connected
    supabaseManager.syncActivity(completedActivity, updatedProfile);

    setSelectedRouteForRun(null);
    setIsLiveRunActive(false);
    setActiveTab('home');
  };

  // Claim Mission XP
  const handleClaimMission = async (missionId: string) => {
    const updated = dailyMissions.map((m) => {
      if (m.id === missionId && m.isCompleted && !m.isClaimed) {
        return { ...m, isClaimed: true };
      }
      return m;
    });
    await storage.saveDailyMissions(updated);
    setDailyMissions(updated);

    // Add XP to profile
    const target = dailyMissions.find((m) => m.id === missionId);
    if (target) {
      const newXp = profile.xp + target.xpReward;
      const updatedProfile = {
        ...profile,
        xp: newXp,
        level: Math.max(profile.level, Math.floor(Math.sqrt(newXp / 250)) + 1),
      };
      await storage.saveProfile(updatedProfile);
      setProfile(updatedProfile);
    }
  };

  // Route Favorites
  const handleToggleFavoriteRoute = async (routeId: string) => {
    const isFav = await storage.toggleFavoriteRoute(routeId);
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, isFavorite: isFav } : r))
    );
  };

  // Custom Route Created
  const handleCreateCustomRoute = async (newRoute: JoggingRoute) => {
    await storage.saveCustomRoute(newRoute);
    setRoutes((prev) => [newRoute, ...prev]);
  };

  // Launch Run from Route
  const handleSelectRouteToRun = (route: JoggingRoute) => {
    setSelectedRouteForRun(route);
    setIsLiveRunActive(true);
    setActiveTab('run');
  };

  // Community Interactions
  const handleToggleKudos = async (activityId: string) => {
    const updated = await storage.toggleKudos(activityId);
    setFeed(updated);
  };

  const handleAddComment = async (activityId: string, commentText: string) => {
    const updated = await storage.addComment(activityId, commentText);
    setFeed(updated);
  };

  const handleToggleJoinClub = async (clubId: string) => {
    const updated = await storage.toggleJoinClub(clubId);
    setClubs(updated);
  };

  // Recovery Log Update
  const handleUpdateRecoveryLog = async (updated: DailyRecoveryLog) => {
    await storage.saveRecoveryLog(updated);
    setRecoveryLog(updated);
    // Refresh coach advice
    const adv = aiCoach.generateDailyAdvice(profile, activities, updated);
    setCoachAdvice(adv);
  };

  // Reset Local Data
  const handleResetData = async () => {
    await storage.resetData();
    const p = await storage.getProfile();
    const acts = await storage.getActivities();
    const rts = await storage.getAllRoutes();
    const achs = await storage.getAchievements();
    const mss = await storage.getDailyMissions();
    setProfile(p);
    setActivities(acts);
    setRoutes(rts);
    setAchievements(achs);
    setDailyMissions(mss);
    setActiveTab('home');
  };

  if (isLoading || !recoveryLog || !coachAdvice) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Show Onboarding if not completed
  if (!profile.onboardingCompleted) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <StatusBar style="light" />
        <OnboardingScreen onCompleteOnboarding={handleCompleteOnboarding} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" />

      {/* Screen Router */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            profile={profile}
            recentActivities={activities}
            dailyMissions={dailyMissions}
            coachAdvice={coachAdvice}
            onStartRun={() => {
              setSelectedRouteForRun(null);
              setIsLiveRunActive(true);
              setActiveTab('run');
            }}
            onOpenCoachChat={() => setShowCoachChat(true)}
            onOpenRouteExplorer={() => setActiveTab('explore')}
            onOpenRecovery={() => setActiveTab('recovery')}
            onClaimMission={handleClaimMission}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreScreen
            routes={routes}
            onSelectRouteToRun={handleSelectRouteToRun}
            onToggleFavorite={handleToggleFavoriteRoute}
            onCreateCustomRoute={handleCreateCustomRoute}
          />
        )}

        {activeTab === 'run' && (
          <LiveRunScreen
            profile={profile}
            initialRoute={selectedRouteForRun}
            onFinishActivity={handleFinishActivity}
            onExit={() => {
              setIsLiveRunActive(false);
              setSelectedRouteForRun(null);
              setActiveTab('home');
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressScreen profile={profile} activities={activities} />
        )}

        {activeTab === 'community' && (
          <CommunityScreen
            feed={feed}
            clubs={clubs}
            challenges={COMMUNITY_CHALLENGES}
            leaderboard={[
              { rank: 1, id: 'u1', displayName: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', weeklyDistanceKm: 46.2, streakCount: 28, level: 6 },
              { rank: 2, id: 'u2', displayName: 'David Kim', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', weeklyDistanceKm: 38.5, streakCount: 19, level: 5 },
              { rank: 3, id: profile.id, displayName: `${profile.displayName} (You)`, avatarUrl: profile.avatarUrl, weeklyDistanceKm: 24.8, streakCount: profile.streakCount, level: profile.level, isCurrentUser: true },
              { rank: 4, id: 'u3', displayName: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', weeklyDistanceKm: 22.4, streakCount: 12, level: 5 },
              { rank: 5, id: 'u4', displayName: 'Marcus Thorne', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', weeklyDistanceKm: 18.2, streakCount: 6, level: 3 },
            ]}
            onToggleKudos={handleToggleKudos}
            onAddComment={handleAddComment}
            onToggleJoinClub={handleToggleJoinClub}
          />
        )}

        {activeTab === 'recovery' && (
          <RecoveryScreen
            recoveryLog={recoveryLog}
            onUpdateRecoveryLog={handleUpdateRecoveryLog}
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            profile={profile}
            achievements={achievements}
            activities={activities}
            onUpdateProfile={(p) => setProfile(p)}
            onOpenRecoveryHub={() => setActiveTab('recovery')}
            onResetData={handleResetData}
          />
        )}
      </View>

      {/* Astrix Bottom Navigation Bar */}
      {activeTab !== 'run' && (
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'run') {
              setSelectedRouteForRun(null);
              setIsLiveRunActive(true);
            }
            setActiveTab(tab);
          }}
          isRunActive={isLiveRunActive}
        />
      )}

      {/* Interactive AI Coach Modal */}
      <CoachChatModal
        visible={showCoachChat}
        onClose={() => setShowCoachChat(false)}
        profile={profile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#08090C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
  },
});
