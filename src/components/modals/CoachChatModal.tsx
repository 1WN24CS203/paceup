import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatMessage } from '../../types/coach';
import { UserProfile } from '../../types/user';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { aiCoach } from '../../services/aiCoach';
import { X, Send, Bot, ShieldAlert } from 'lucide-react-native';

interface CoachChatModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const CoachChatModal: React.FC<CoachChatModalProps> = ({
  visible,
  onClose,
  profile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'coach',
      text: `Hey ${profile.displayName}! I am your PACEUP AI Coach. I design your workouts using sports science periodization—ensuring gradual 10% volume progression, safe cadence, and optimal recovery days.\n\nAsk me anything about pacing, breathing, recovery, hydration, or injury prevention!`,
      timestamp: Date.now(),
      quickReplies: [
        'How to prevent side stitches?',
        'What should I eat before running?',
        'How to improve cadence?',
        'Why are rest days important?',
      ],
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');

    // Generate local rule-based sports-science advice
    setTimeout(() => {
      const coachReply = aiCoach.processUserQuestion(query, profile);
      setMessages((prev) => [...prev, coachReply]);
    }, 400);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coachHeaderInfo}>
            <View style={styles.botIconCircle}>
              <Bot size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.coachName}>PACEUP AI COACH</Text>
              <Text style={styles.coachStatus}>SPORTS SCIENCE ENGINE ACTIVE</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Safety Disclaimer Banner */}
        <View style={styles.safetyBanner}>
          <ShieldAlert size={14} color={COLORS.amber} />
          <Text style={styles.safetyText}>
            Medical guidance: Never exercise through sharp pain, dizziness or fever.
          </Text>
        </View>

        {/* Message Thread */}
        <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.msgBubble,
                  isUser ? styles.userBubble : styles.coachBubble,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    isUser ? styles.userMsgText : styles.coachMsgText,
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Quick Reply Pills */}
                {!isUser && msg.quickReplies && (
                  <View style={styles.quickRepliesContainer}>
                    {msg.quickReplies.map((qr, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => handleSend(qr)}
                        style={styles.quickPill}
                      >
                        <Text style={styles.quickPillText}>{qr}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about pacing, shoes, recovery..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.textInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
            disabled={!input.trim()}
          >
            <Send size={18} color="#08090C" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  coachHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  coachName: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  coachStatus: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  closeBtn: {
    padding: 6,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.2)',
  },
  safetyText: {
    fontSize: 11,
    color: COLORS.amber,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 14,
  },
  msgBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: TYPOGRAPHY.fontFamily.body,
  },
  userMsgText: {
    color: '#08090C',
    fontWeight: '600',
  },
  coachMsgText: {
    color: COLORS.textPrimary,
  },
  quickRepliesContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickPill: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPillText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.primary,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    color: COLORS.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

