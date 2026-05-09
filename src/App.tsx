/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AuthState, SleepLog, UserSettings } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

const INITIAL_LOGS: SleepLog[] = [
  {
    id: '1',
    date: '2026-04-05T00:00:00Z',
    bedTime: '23:15',
    wakeTime: '07:20',
    quality: 5,
    duration: 485
  },
  {
    id: '2',
    date: '2026-04-04T00:00:00Z',
    bedTime: '00:00',
    wakeTime: '07:30',
    quality: 4,
    duration: 450
  },
  {
    id: '3',
    date: '2026-04-03T00:00:00Z',
    bedTime: '22:45',
    wakeTime: '06:50',
    quality: 5,
    duration: 485
  }
];

const INITIAL_SETTINGS: UserSettings = {
  userName: '',
  bedtimeReminder: '22:30',
  wakeUpReminder: '07:00',
  remindersEnabled: false
};

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthState('authenticated');
      } else {
        setAuthState('login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load local data
  useEffect(() => {
    const savedLogs = localStorage.getItem('sleep_logs');
    const savedSettings = localStorage.getItem('sleep_settings');

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    else setLogs(INITIAL_LOGS);

    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save local data
  useEffect(() => {
    localStorage.setItem('sleep_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('sleep_settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleEnableNotifications = async () => {
    // Check if the browser supports notifications at all
    if (!("Notification" in window)) {
      // Fallback for mobile/browsers without Notification API
      setSettings(prev => ({ ...prev, remindersEnabled: true }));
      alert("Note: Your browser doesn't support system-level notifications, but we've enabled in-app reminders for you! Keep the app open to receive alerts.");
      return;
    }

    try {
      // In some environments, Permission might be requested via a callback or promise
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setSettings(prev => ({ ...prev, remindersEnabled: true }));
        try {
          new Notification("Sleep Sync", { 
            body: "Notifications enabled! We'll remind you when it's time to sleep.",
          });
        } catch (e) {
          // Fallback if constructor fails (common on some mobile browsers even if API exists)
          alert("Notifications enabled! We'll show in-app reminders if system alerts are blocked.");
        }
      } else if (permission === "denied") {
        alert("Notification permission was denied. Please update your browser settings or site permissions to enable this feature.");
      } else {
        // Dismissed / Default
        alert("You'll need to allow notifications to receive sleep reminders.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      // Final fallback
      setSettings(prev => ({ ...prev, remindersEnabled: true }));
      alert("We encountered an error, but we've enabled in-app reminders for you!");
    }
  };

  // Notification Polling Logic
  useEffect(() => {
    if (!settings.remindersEnabled || authState !== 'authenticated') return;

    let lastNotifiedTime: string | null = null;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (currentTime === lastNotifiedTime) return;

      const triggerNotification = (title: string, body: string) => {
        // Try native notification first
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(title, { body });
            lastNotifiedTime = currentTime;
            return;
          } catch (e) {
            // Fallback to browser alert if constructor fails
          }
        }
        
        // Final fallback: Browser Alert (works everywhere)
        alert(`${title}: ${body}`);
        lastNotifiedTime = currentTime;
      };

      if (currentTime === settings.bedtimeReminder) {
        triggerNotification("Sleep Sync", "It's time to wind down and get some rest! 🌙");
      }

      if (currentTime === settings.wakeUpReminder) {
        triggerNotification("Sleep Sync", "Good morning! Time for a fresh start. ☀️");
      }
    };

    // Check every 30 seconds for better reliability with minute boundary
    const interval = setInterval(checkReminders, 30000);
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [settings.bedtimeReminder, settings.wakeUpReminder, settings.remindersEnabled, authState]);

  const handleAddLog = (newLog: Omit<SleepLog, 'id'>) => {
    const log: SleepLog = {
      ...newLog,
      id: Math.random().toString(36).substr(2, 9)
    };
    setLogs(prev => [log, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center">
      <div className="w-full max-w-[500px] min-h-screen bg-secondary shadow-xl overflow-x-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center bg-secondary"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-primary"
                >
                  <div className="flex items-center justify-center">
                    <MoonIcon size={32} strokeWidth={1.5} />
                  </div>
                </motion.div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : authState === 'authenticated' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <Dashboard 
                logs={logs}
                settings={settings}
                onAddLog={handleAddLog}
                onDeleteLog={handleDeleteLog}
                onUpdateSettings={setSettings}
                onLogout={handleLogout}
                onEnableNotifications={handleEnableNotifications}
              />
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              <Auth 
                 view={authState as any} 
                 onViewChange={(v) => setAuthState(v as any)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Simple Moon icon placeholder for local scope if needed
function MoonIcon({ size = 24, strokeWidth = 2 }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}
