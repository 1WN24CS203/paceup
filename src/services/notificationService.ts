export interface ReminderSchedule {
  id: string;
  title: string;
  time: string; // "06:30"
  type: 'morning_run' | 'evening_walk' | 'hydration' | 'streak_shield';
  isEnabled: boolean;
  repeatDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

export class NotificationService {
  private reminders: ReminderSchedule[] = [
    {
      id: 'rem_morning',
      title: '🌅 Morning Stride Reminder',
      time: '06:30',
      type: 'morning_run',
      isEnabled: true,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
      id: 'rem_streak',
      title: '🔥 Streak Protection Alert',
      time: '18:00',
      type: 'streak_shield',
      isEnabled: true,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    {
      id: 'rem_hydration',
      title: '💧 Midday Hydration Check',
      time: '13:00',
      type: 'hydration',
      isEnabled: true,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
  ];

  getReminders(): ReminderSchedule[] {
    return this.reminders;
  }

  toggleReminder(id: string): ReminderSchedule[] {
    this.reminders = this.reminders.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    return [...this.reminders];
  }

  updateTime(id: string, time: string): ReminderSchedule[] {
    this.reminders = this.reminders.map((r) => (r.id === id ? { ...r, time } : r));
    return [...this.reminders];
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return true;
  }
}

export const notificationService = new NotificationService();

