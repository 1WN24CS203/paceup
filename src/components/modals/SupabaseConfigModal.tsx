import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { supabaseManager } from '../../services/supabaseClient';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { NeonButton } from '../astrix/NeonButton';
import { X, Cloud, ShieldCheck, Database } from 'lucide-react-native';

interface SupabaseConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  visible,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      const config = supabaseManager.getConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setIsEnabled(config.isEnabled);
    }
  }, [visible]);

  const handleSave = async () => {
    setIsSaving(true);
    await supabaseManager.saveConfig(url, anonKey, isEnabled);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Cloud size={20} color={COLORS.primary} />
              <Text style={styles.title}>SUPABASE CLOUD SYNC</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            PACEUP operates 100% offline with zero paywalls. Connect your free Supabase project to sync activities across devices and backup your streaks.
          </Text>

          {/* Toggle Sync */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>ENABLE CLOUD SYNC</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.primaryDark }}
              thumbColor={isEnabled ? COLORS.primary : '#888'}
            />
          </View>

          {/* Inputs */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>SUPABASE PROJECT URL</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://xyzcompany.supabase.co"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>SUPABASE ANON KEY</Text>
            <TextInput
              value={anonKey}
              onChangeText={setAnonKey}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.privacyPill}>
            <ShieldCheck size={14} color={COLORS.primary} />
            <Text style={styles.privacyText}>
              Protected by Supabase Row-Level Security (RLS) & local device isolation.
            </Text>
          </View>

          <View style={styles.actions}>
            <NeonButton
              title="SAVE CONFIGURATION"
              onPress={handleSave}
              isLoading={isSaving}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.1,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 14,
  },
  toggleLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
    marginVertical: 10,
  },
  privacyText: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    flex: 1,
  },
  actions: {
    marginTop: 10,
  },
});

