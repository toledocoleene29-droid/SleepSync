export interface SleepLog {
  id: string;
  date: string; // ISO string
  bedTime: string; // "HH:mm"
  wakeTime: string; // "HH:mm"
  quality: number; // 1-5
  duration: number; // minutes
}

export interface UserSettings {
  userName: string;
  bedtimeReminder: string; // "HH:mm"
  wakeUpReminder: string; // "HH:mm"
  remindersEnabled: boolean;
}

export type AuthState = 'login' | 'signup' | 'authenticated';
