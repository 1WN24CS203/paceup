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
import { UserProfile, FitnessLevel, FitnessGoal } from '../types/user';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from '../components/astrix/GlassCard';
import { NeonButton } from '../components/astrix/NeonButton';
import { TickerTape } from '../components/astrix/TickerTape';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Check,
  Target,
  Clock,
  Activity as ActivityIcon,
} from 'lucide-react-native';

interface OnboardingScreenProps {
  onCompleteOnboarding: (profileData: Partial<UserProfile>) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [displayName, setDisplayName] = useState('Jordan Pace');
  const [age, setAge] = useState('27');
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('68');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('beginner');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('5k_prep');
  const [availabilityMin, setAvailabilityMin] = useState(30);
  const [preferredActivity, setPreferredActivity] = useState<'walk' | 'jog' | 'run'>('jog');

  const handleFinish = () => {
    onCompleteOnboarding({
      displayName: displayName.trim() || 'Athlete',
      age: parseInt(age) || 26,
      heightCm: parseInt(heightCm) || 175,
      weightKg: parseInt(weightKg) || 70,
      fitnessLevel,
      fitnessGoal,
      dailyAvailabilityMin: availabilityMin,
      preferredActivity,
      onboardingCompleted: true,
    });
  };

  return (
    <View style={styles.container}>
      <TickerTape
        items={[
          'PACEUP // WELCOME ATHLETE',
          'INITIALIZING AI COACH ENGINE',
          'SPORTS SCIENCE PERIODIZATION',
          '100% FREE FOREVER',
        ]}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/paceup-logo.png')}
            style={styles.onboardingLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>
            PACE<Text style={{ color: COLORS.primary }}>UP</Text>
          </Text>
          <Text style={styles.tagline}>"EVERY STEP COUNTS. EVERY DAY LEVELS YOU UP."</Text>
        </View>

        {/* Step Progress Bar */}
        <View style={styles.stepTrack}>
          <View style={[styles.stepFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.stepCount}>STEP {step} OF 3</Text>

        {/* STEP 1: Basic Biometrics */}
        {step === 1 && (
          <GlassCard highlight="lime" style={styles.card}>
            <Text style={styles.cardHeading}>LET'S CALIBRATE YOUR METRICS</Text>
            <Text style={styles.cardSub}>
              Used locally for accurate MET calorie calculation & aerobic zone planning.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ATHLETE NAME</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.textInput}
                placeholder="Your Name"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>AGE</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>HEIGHT (CM)</Text>
                <TextInput
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>WEIGHT (KG)</Text>
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            </View>

            <NeonButton
              title="CONTINUE"
              onPress={() => setStep(2)}
              variant="primary"
              size="lg"
              style={{ marginTop: 14 }}
              icon={<ArrowRight size={18} color="#08090C" />}
            />
          </GlassCard>
        )}

        {/* STEP 2: Fitness Experience & Activity */}
        {step === 2 && (
          <GlassCard highlight="cyan" style={styles.card}>
            <Text style={styles.cardHeading}>FITNESS BASE & EXPERIENCE</Text>
            <Text style={styles.cardSub}>
              Our AI Coach enforces gradual 10% volume progression to prevent shin splints.
            </Text>

            <Text style={styles.fieldLabel}>CURRENT FITNESS EXPERIENCE</Text>
            <View style={styles.optionList}>
              {[
                { key: 'beginner', label: 'Beginner', desc: 'Starting out or returning after a break' },
                { key: 'intermediate', label: 'Intermediate', desc: 'Comfortable jogging 2-5 KM regularly' },
                { key: 'advanced', label: 'Advanced', desc: 'Regularly running 5-10+ KM with structured pace' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setFitnessLevel(opt.key as FitnessLevel)}
                  style={[
                    styles.optCard,
                    fitnessLevel === opt.key && styles.optCardActive,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optTitle,
                        fitnessLevel === opt.key && { color: COLORS.primary },
                      ]}
                    >
                      {opt.label.toUpperCase()}
                    </Text>
                    <Text style={styles.optDesc}>{opt.desc}</Text>
                  </View>
                  {fitnessLevel === opt.key && <Check size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>PREFERRED ACTIVITY TYPE</Text>
            <View style={styles.actRow}>
              {(['walk', 'jog', 'run'] as const).map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setPreferredActivity(a)}
                  style={[
                    styles.actPill,
                    preferredActivity === a && styles.actPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.actPillText,
                      preferredActivity === a && styles.actPillTextActive,
                    ]}
                  >
                    {a.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.twoBtnRow}>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backStepBtn}>
                <Text style={styles.backStepText}>BACK</Text>
              </TouchableOpacity>
              <NeonButton
                title="NEXT STEP"
                onPress={() => setStep(3)}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </GlassCard>
        )}

        {/* STEP 3: Goals & Availability */}
        {step === 3 && (
          <GlassCard highlight="lime" style={styles.card}>
            <Text style={styles.cardHeading}>PRIMARY MISSION & AVAILABILITY</Text>
            <Text style={styles.cardSub}>
              We will generate a custom 4-week periodized plan with scheduled recovery days.
            </Text>

            <Text style={styles.fieldLabel}>PRIMARY FITNESS GOAL</Text>
            <View style={styles.optionList}>
              {[
                { key: 'habit_building', label: 'Consistent Daily Habit', desc: 'Daily walks & gentle jogs without burnout' },
                { key: '5k_prep', label: 'Couch to 5.0 KM', desc: 'Continuous 5K running through structured walk/jog intervals' },
                { key: '10k_prep', label: '10K Endurance', desc: 'Tempo surges and aerobic base building' },
                { key: 'weight_management', label: 'Caloric & Aerobic Health', desc: 'Zone 2 steady-state movement' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setFitnessGoal(opt.key as FitnessGoal)}
                  style={[
                    styles.optCard,
                    fitnessGoal === opt.key && styles.optCardActive,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optTitle,
                        fitnessGoal === opt.key && { color: COLORS.primary },
                      ]}
                    >
                      {opt.label.toUpperCase()}
                    </Text>
                    <Text style={styles.optDesc}>{opt.desc}</Text>
                  </View>
                  {fitnessGoal === opt.key && <Check size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
              TARGET DAILY DURATION: {availabilityMin} MINUTES
            </Text>
            <View style={styles.durationRow}>
              {[20, 30, 45, 60].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setAvailabilityMin(m)}
                  style={[
                    styles.durPill,
                    availabilityMin === m && styles.durPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.durPillText,
                      availabilityMin === m && styles.durPillTextActive,
                    ]}
                  >
                    {m} MIN
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.twoBtnRow}>
              <TouchableOpacity onPress={() => setStep(2)} style={styles.backStepBtn}>
                <Text style={styles.backStepText}>BACK</Text>
              </TouchableOpacity>
              <NeonButton
                title="GENERATE MY PLAN"
                onPress={handleFinish}
                variant="primary"
                size="lg"
                style={{ flex: 1 }}
                icon={<Sparkles size={18} color="#08090C" />}
              />
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 36,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
  },
  stepTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  stepFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  stepCount: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    padding: 20,
  },
  cardHeading: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 6,
    lineHeight: 16,
  },
  fieldGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  optionList: {
    gap: 8,
    marginTop: 4,
  },
  optCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
  },
  optTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  optDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actPillActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.primary,
  },
  actPillText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  actPillTextActive: {
    color: COLORS.primary,
  },
  twoBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  backStepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backStepText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durPillActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.primary,
  },
  durPillText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  durPillTextActive: {
    color: COLORS.primary,
  },
});
