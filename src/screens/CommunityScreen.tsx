import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { ActivityFeedItem, RunningClub, CommunityChallenge } from '../types/community';
import { LeaderboardUser } from '../types/gamification';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from '../components/astrix/GlassCard';
import { NeonButton } from '../components/astrix/NeonButton';
import {
  Heart,
  MessageSquare,
  Users,
  Trophy,
  Flame,
  Plus,
  Shield,
  Send,
  Check,
} from 'lucide-react-native';

interface CommunityScreenProps {
  feed: ActivityFeedItem[];
  clubs: RunningClub[];
  challenges: CommunityChallenge[];
  leaderboard: LeaderboardUser[];
  onToggleKudos: (activityId: string) => void;
  onAddComment: (activityId: string, text: string) => void;
  onToggleJoinClub: (clubId: string) => void;
}

type CommunityTab = 'feed' | 'clubs' | 'leaderboard';

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  feed,
  clubs,
  challenges,
  leaderboard,
  onToggleKudos,
  onAddComment,
  onToggleJoinClub,
}) => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const handlePostComment = (activityId: string) => {
    const text = commentInput[activityId];
    if (!text || !text.trim()) return;
    onAddComment(activityId, text.trim());
    setCommentInput({ ...commentInput, [activityId]: '' });
    setActiveCommentPostId(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>COMMUNITY HUB</Text>
          <View style={styles.privacyBadge}>
            <Shield size={12} color={COLORS.cyan} />
            <Text style={styles.privacyText}>PRIVACY PROTECTED</Text>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('feed')}
            style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'feed' && styles.tabBtnTextActive,
              ]}
            >
              FEED
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('clubs')}
            style={[styles.tabBtn, activeTab === 'clubs' && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'clubs' && styles.tabBtnTextActive,
              ]}
            >
              RUN CLUBS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('leaderboard')}
            style={[styles.tabBtn, activeTab === 'leaderboard' && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'leaderboard' && styles.tabBtnTextActive,
              ]}
            >
              LEADERBOARD
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* TAB 1: ACTIVITY FEED */}
        {activeTab === 'feed' && (
          <View>
            {feed.map((post) => (
              <GlassCard key={post.id} style={styles.postCard}>
                {/* User Header */}
                <View style={styles.postUserRow}>
                  <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{post.userName}</Text>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>LVL {post.userLevel}</Text>
                      </View>
                    </View>
                    <Text style={styles.postTimestamp}>{post.createdAt}</Text>
                  </View>
                </View>

                {/* Activity Title & Metrics */}
                <Text style={styles.activityTitle}>{post.activityTitle}</Text>

                <View style={styles.telemetryBanner}>
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>{post.distanceKm.toFixed(1)} KM</Text>
                    <Text style={styles.statLbl}>DISTANCE</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>{post.paceMinKm} /km</Text>
                    <Text style={styles.statLbl}>PACE</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>{post.caloriesBurned}</Text>
                    <Text style={styles.statLbl}>CALORIES</Text>
                  </View>
                </View>

                {/* Badges Earned */}
                {post.badgesEarned && post.badgesEarned.length > 0 && (
                  <View style={styles.badgesRow}>
                    {post.badgesEarned.map((b, i) => (
                      <View key={i} style={styles.earnedBadgePill}>
                        <Text style={styles.earnedBadgeText}>⚡ {b}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions: Kudos & Comments */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => onToggleKudos(post.id)}
                    style={[
                      styles.actionBtn,
                      post.hasGivenKudos && styles.actionBtnKudosActive,
                    ]}
                  >
                    <Heart
                      size={16}
                      color={post.hasGivenKudos ? COLORS.coral : COLORS.textMuted}
                      fill={post.hasGivenKudos ? COLORS.coral : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        post.hasGivenKudos && { color: COLORS.coral },
                      ]}
                    >
                      {post.kudosCount} KUDOS
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                    }
                    style={styles.actionBtn}
                  >
                    <MessageSquare size={16} color={COLORS.textMuted} />
                    <Text style={styles.actionBtnText}>
                      {post.commentsCount} COMMENTS
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Comment Thread */}
                {post.comments.length > 0 && (
                  <View style={styles.commentThread}>
                    {post.comments.map((c) => (
                      <View key={c.id} style={styles.commentItem}>
                        <Text style={styles.commentUser}>{c.userName}: </Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Comment Input */}
                {activeCommentPostId === post.id && (
                  <View style={styles.commentInputRow}>
                    <TextInput
                      value={commentInput[post.id] || ''}
                      onChangeText={(t) => setCommentInput({ ...commentInput, [post.id]: t })}
                      placeholder="Cheer on your peer..."
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.commentInputField}
                    />
                    <TouchableOpacity
                      onPress={() => handlePostComment(post.id)}
                      style={styles.sendCommentBtn}
                    >
                      <Send size={14} color="#08090C" />
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {/* TAB 2: RUNNING CLUBS & CHALLENGES */}
        {activeTab === 'clubs' && (
          <View>
            <Text style={styles.subHeading}>FEATURED RUNNING SQUADS</Text>
            {clubs.map((club) => (
              <GlassCard key={club.id} style={styles.clubCard}>
                <Image source={{ uri: club.coverImage }} style={styles.clubCover} />
                <View style={styles.clubBody}>
                  <View style={styles.clubTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clubName}>
                        {club.badge} {club.name}
                      </Text>
                      <Text style={styles.clubCity}>{club.city.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onToggleJoinClub(club.id)}
                      style={[
                        styles.joinClubBtn,
                        club.isJoined && styles.joinedClubBtn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.joinClubBtnText,
                          club.isJoined && styles.joinedClubBtnText,
                        ]}
                      >
                        {club.isJoined ? 'JOINED' : 'JOIN SQUAD'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.clubTagline}>{club.tagline}</Text>

                  {/* Club Weekly Goal Progress */}
                  <View style={styles.clubGoalTrack}>
                    <View style={styles.clubGoalHeader}>
                      <Text style={styles.clubGoalLbl}>SQUAD WEEKLY MILEAGE</Text>
                      <Text style={styles.clubGoalVal}>
                        {club.weeklyCurrentKm} / {club.weeklyGoalKm} KM
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, Math.round((club.weeklyCurrentKm / club.weeklyGoalKm) * 100))}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* TAB 3: WEEKLY LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <View>
            <View style={styles.leaderboardHeaderCard}>
              <Trophy size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.lbHeaderTitle}>GLOBAL WEEKLY STRIDERS</Text>
                <Text style={styles.lbHeaderSub}>Resets every Sunday at midnight UTC</Text>
              </View>
            </View>

            {leaderboard.map((user) => (
              <GlassCard
                key={user.id}
                highlight={user.isCurrentUser ? 'lime' : 'none'}
                style={styles.lbUserCard}
              >
                <View style={styles.lbRankBadge}>
                  <Text
                    style={[
                      styles.lbRankText,
                      user.rank === 1 && { color: COLORS.primary },
                      user.rank === 2 && { color: COLORS.cyan },
                      user.rank === 3 && { color: COLORS.amber },
                    ]}
                  >
                    #{user.rank}
                  </Text>
                </View>

                <Image source={{ uri: user.avatarUrl }} style={styles.lbAvatar} />

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.lbName,
                      user.isCurrentUser && { color: COLORS.primary, fontWeight: '900' },
                    ]}
                  >
                    {user.displayName}
                  </Text>
                  <View style={styles.lbUserSub}>
                    <Text style={styles.lbStreak}>🔥 {user.streakCount}d streak</Text>
                    <Text style={styles.lbDot}>•</Text>
                    <Text style={styles.lbLevel}>Level {user.level}</Text>
                  </View>
                </View>

                <View style={styles.lbKmContainer}>
                  <Text style={styles.lbKmText}>{user.weeklyDistanceKm.toFixed(1)}</Text>
                  <Text style={styles.lbKmLabel}>KM</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  privacyText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.cyan,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: '#08090C',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  postCard: {
    marginBottom: 14,
    padding: 16,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  levelBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  levelBadgeText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  postTimestamp: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  activityTitle: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  telemetryBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statLbl: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  earnedBadgePill: {
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  earnedBadgeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnKudosActive: {
    opacity: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  commentThread: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    gap: 4,
  },
  commentItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUser: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.primary,
  },
  commentText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  commentInputField: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  sendCommentBtn: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeading: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  clubCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 14,
  },
  clubCover: {
    height: 120,
    width: '100%',
  },
  clubBody: {
    padding: 16,
  },
  clubTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  clubName: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  clubCity: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  joinClubBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinedClubBtn: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  joinClubBtnText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: '#08090C',
  },
  joinedClubBtnText: {
    color: COLORS.textMuted,
  },
  clubTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  clubGoalTrack: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  clubGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  clubGoalLbl: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  clubGoalVal: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  leaderboardHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  lbHeaderTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  lbHeaderSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  lbUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 10,
  },
  lbRankBadge: {
    width: 28,
    alignItems: 'center',
  },
  lbRankText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.textMuted,
  },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lbName: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  lbUserSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  lbStreak: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.coral,
  },
  lbDot: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  lbLevel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
  lbKmContainer: {
    alignItems: 'flex-end',
  },
  lbKmText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontWeight: '900',
    color: COLORS.primary,
  },
  lbKmLabel: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
  },
});
