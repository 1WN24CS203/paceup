import * as Speech from 'expo-speech';
import { Split } from '../types/activity';

export class AudioCoachService {
  private isEnabled = true;

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  speak(text: string) {
    if (!this.isEnabled) return;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        return;
      }

      Speech.stop();
      Speech.speak(text, {
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  announceActivityStart(activityType: string) {
    const formatted = activityType.replace('_', ' ');
    this.speak(`Activity started. Tracking your ${formatted}. Pace strong and stay relaxed.`);
  }

  announcePause() {
    this.speak('Activity paused.');
  }

  announceResume() {
    this.speak('Activity resumed. Let’s keep moving.');
  }

  announceSplit(split: Split) {
    const min = Math.floor(split.paceSecPerKm / 60);
    const sec = split.paceSecPerKm % 60;
    const paceStr = `${min} minutes ${sec > 0 ? sec + ' seconds' : ''}`;
    this.speak(`Kilometer ${split.kilometer} complete. Split pace: ${paceStr} per kilometer. Keep your cadence steady.`);
  }

  announceFinish(distanceKm: number, durationSec: number, avgPaceSec: number) {
    const minDuration = Math.round(durationSec / 60);
    const paceMin = Math.floor(avgPaceSec / 60);
    const paceSec = avgPaceSec % 60;
    this.speak(
      `Outstanding session! You completed ${distanceKm.toFixed(2)} kilometers in ${minDuration} minutes, averaging ${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec} per kilometer. Every step counts!`
    );
  }
}

export const audioCoach = new AudioCoachService();
