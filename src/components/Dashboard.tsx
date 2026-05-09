import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, Star, Plus, Bell, Clock, Sun, Trash2, Activity,
  ChevronRight, Calendar, LogOut
} from 'lucide-react';
import { SleepLog, UserSettings } from '../types';
import { cn, formatMinutes, calculateDuration } from '../lib/utils';
import { format, parseISO } from 'date-fns';

interface DashboardProps {
  logs: SleepLog[];
  settings: UserSettings;
  onAddLog: (log: Omit<SleepLog, 'id'>) => void;
  onDeleteLog: (id: string) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onLogout: () => void;
  onEnableNotifications: () => void;
}

export function Dashboard({ logs, settings, onAddLog, onDeleteLog, onUpdateSettings, onLogout, onEnableNotifications }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:30');
  const [quality, setQuality] = useState(4);

  const avgSleep = logs.length > 0 
    ? logs.reduce((acc, log) => acc + log.duration, 0) / logs.length 
    : 0;
  
  const avgQuality = logs.length > 0
    ? (logs.reduce((acc, log) => acc + log.quality, 0) / logs.length).toFixed(1)
    : '0.0';

  const handleAdd = () => {
    onAddLog({
      date: new Date(selectedDate).toISOString(),
      bedTime,
      wakeTime,
      quality,
      duration: calculateDuration(bedTime, wakeTime)
    });
    // Reset date to today after adding
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const updateReminder = (type: 'bed' | 'wake', value: string) => {
    onUpdateSettings({
      ...settings,
      [type === 'bed' ? 'bedtimeReminder' : 'wakeUpReminder']: value
    });
  };

  return (
    <div className="p-6 pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center py-4 relative">
        <button 
          onClick={onLogout}
          className="absolute right-0 top-4 w-10 h-10 rounded-xl bg-accent/40 flex items-center justify-center text-primary/60 hover:text-primary transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
          <Moon className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-primary">sleep sync</h1>
        <p className="text-[10px] uppercase tracking-widest text-text-dim/60 font-bold">track. rest. thrive.</p>
      </div>

      {/* Insights */}
      <section className="bg-accent/40 rounded-[32px] p-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
              <Calendar className="w-3 h-3 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-primary">Sleep insights</h2>
          </div>
          <div className="bg-primary px-2 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">live data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <InsightCard label="Avg sleep" value={formatMinutes(avgSleep)} />
          <InsightCard label="Total logs" value={logs.length.toString()} />
          <InsightCard label="Quality" value={`★${avgQuality}`} />
        </div>
      </section>

      {/* Record Sleep */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-primary">Record sleep</h2>
        </div>
        
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-accent/20 space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <InputWrapper label="Date" icon={<Calendar className="w-3 h-3" />}>
                   <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full text-xs font-medium focus:outline-none bg-transparent" 
                   />
                </InputWrapper>
                <InputWrapper label="Bedtime" icon={<Moon className="w-3 h-3" />}>
                   <input 
                    type="time" 
                    value={bedTime} 
                    onChange={e => setBedTime(e.target.value)}
                    className="w-full text-xs font-medium focus:outline-none bg-transparent" 
                   />
                </InputWrapper>
                <InputWrapper label="Wake-up" icon={<Sun className="w-3 h-3" />}>
                   <input 
                    type="time" 
                    value={wakeTime} 
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full text-xs font-medium focus:outline-none bg-transparent" 
                   />
                </InputWrapper>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 bg-accent/20 rounded-2xl h-12 flex items-center px-4">
                    <select 
                        value={quality} 
                        onChange={e => setQuality(Number(e.target.value))}
                        className="w-full bg-transparent text-xs font-bold text-primary focus:outline-none appearance-none"
                    >
                        <option value={5}>Excellent (5★)</option>
                        <option value={4}>Good (4★)</option>
                        <option value={3}>Fair (3★)</option>
                        <option value={2}>Poor (2★)</option>
                        <option value={1}>Bad (1★)</option>
                    </select>
                </div>
                <button 
                    onClick={handleAdd}
                    className="bg-primary text-white px-6 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add log
                </button>
            </div>
        </div>
      </section>

      {/* Smart Reminders */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-primary">Smart reminders</h2>
        </div>
        
        <div className="bg-accent/20 rounded-[32px] p-6 space-y-4">
            <ReminderRow 
                icon={<Moon className="w-4 h-4" />} 
                label="Bedtime:" 
                time={settings.bedtimeReminder} 
                onTimeChange={(val) => updateReminder('bed', val)}
            />
            <ReminderRow 
                icon={<Sun className="w-4 h-4" />} 
                label="Wake-up:" 
                time={settings.wakeUpReminder} 
                onTimeChange={(val) => updateReminder('wake', val)}
            />
            <div className="pt-2">
                <div className="flex items-start gap-2 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-primary/40 mt-1" />
                    <p className="text-[9px] font-medium leading-relaxed text-text-dim">
                        Reminders work if notifications are allowed <br/>
                        <button 
                          onClick={onEnableNotifications}
                          className={cn(
                            "underline font-bold transition-colors",
                            settings.remindersEnabled ? "text-green-600 no-underline cursor-default" : "text-primary hover:text-primary/70"
                          )}
                        >
                          {settings.remindersEnabled ? "✓ Notifications active" : "Enable notifications"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Sleep History */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-primary">Sleep history</h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {logs.length === 0 ? (
                <div className="text-center py-8 opacity-40 italic text-xs">No logs yet. Take a nap?</div>
            ) : (
                logs.sort((a,b) => b.date.localeCompare(a.date)).map((log, idx) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-3xl p-5 border border-accent/20 relative"
                    >
                        <div className="flex items-start justify-between mb-3 leading-none">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-accent/60 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-xs font-bold text-primary">{format(parseISO(log.date), 'yyyy-MM-dd')}</span>
                            </div>
                            <button 
                                onClick={() => onDeleteLog(log.id)}
                                className="w-7 h-7 bg-accent/40 rounded-lg flex items-center justify-center text-primary/40 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[10px] font-semibold text-text-dim/70">
                                <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> Bed: {log.bedTime}</span>
                                <span className="w-1 h-1 bg-accent/80 rounded-full" />
                                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Wake: {log.wakeTime}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-accent/10">
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatMinutes(log.duration)}
                            </span>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={cn("w-2.5 h-2.5", i < log.quality ? "fill-primary text-primary" : "text-accent")} 
                                        strokeWidth={3}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Comparison Tooltip */}
      <div className="bg-accent/10 rounded-3xl p-6 border border-accent/20 mt-4">
        <div className="grid grid-cols-2 gap-8 relative">
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-red-500">
                    <span className="w-4 h-4">✕</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Old way</span>
                </div>
                <p className="text-[9px] font-medium leading-tight opacity-70">
                    Irregular schedules, no reminders → fatigue
                </p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-primary">
                    <span className="w-4 h-4">✔</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Sleep Sync</span>
                </div>
                <p className="text-[9px] font-medium leading-tight opacity-70">
                    Smart reminders, reports, automated logs
                </p>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-accent/40" />
        </div>
      </div>

      {/* Footer Meta */}
      <div className="flex flex-col items-center gap-2 opacity-30 mt-8">
        <div className="h-px w-full bg-accent" />
        <p className="text-[8px] font-bold tracking-tight">
          ~ Students • Workers • Health conscious | ☯ PACT: Activities, Context, Tech
        </p>
      </div>
    </div>
  );
}

function InsightCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-accent/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
      <span className="text-[9px] font-bold text-text-dim/60 uppercase mb-1 tracking-tighter">{label}</span>
      <span className="text-sm font-black text-primary">{value}</span>
    </div>
  );
}

function InputWrapper({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 px-1">
        <span className="text-text-dim/60">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-tighter text-text-dim/60">{label}</span>
      </div>
      <div className="bg-accent/10 rounded-xl px-3 py-2 border border-accent/10">
        {children}
      </div>
    </div>
  );
}

function ReminderRow({ icon, label, time, onTimeChange }: { icon: React.ReactNode, label: string, time: string, onTimeChange: (val: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
          {icon}
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-black text-text-dim/60 uppercase tracking-tighter mb-1">{label}</span>
          <input 
            type="time" 
            value={time} 
            onChange={(e) => onTimeChange(e.target.value)}
            className="text-sm font-black text-primary bg-transparent focus:outline-none cursor-pointer"
          />
        </div>
      </div>
      <div className="bg-accent h-7 px-3 rounded-lg flex items-center gap-1 text-[9px] font-black text-primary uppercase opacity-60">
        <Clock className="w-3 h-3" /> Scheduled
      </div>
    </div>
  );
}
