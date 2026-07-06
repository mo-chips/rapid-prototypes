import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Briefcase, ListTodo, Zap } from 'lucide-react';

import type { TimerState } from './MiniTimerWindow';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';
type PlanStep = { type: 'work' | 'break'; duration: number };

const MODE_TIMES = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

type PomodoroProps = {
  onTimerStateChange?: (isActive: boolean) => void;
  onStateChange?: (state: TimerState) => void;
};

export function PomodoroTimer({ onTimerStateChange, onStateChange }: PomodoroProps) {
  const [isPlannedMode, setIsPlannedMode] = useState(false);

  // Quick Timer State
  const [mode, setMode] = useState<Mode>('pomodoro');

  // Planned Session State
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Inputs for Plan
  const [totalMinutes, setTotalMinutes] = useState(120);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Shared State
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [totalDurationForProgress, setTotalDurationForProgress] = useState(MODE_TIMES.pomodoro);

  const generatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMinutes <= 0 || focusMinutes <= 0 || breakMinutes <= 0) return;

    let remaining = totalMinutes;
    const newPlan: PlanStep[] = [];

    while (remaining > 0) {
      if (remaining >= focusMinutes) {
        newPlan.push({ type: 'work', duration: focusMinutes * 60 });
        remaining -= focusMinutes;
      } else {
        newPlan.push({ type: 'work', duration: remaining * 60 });
        remaining = 0;
        break;
      }

      if (remaining > 0) {
        if (remaining >= breakMinutes) {
          newPlan.push({ type: 'break', duration: breakMinutes * 60 });
          remaining -= breakMinutes;
        } else {
          newPlan.push({ type: 'break', duration: remaining * 60 });
          remaining = 0;
          break;
        }
      }
    }

    setPlan(newPlan);
    setCurrentStep(0);
    setTimeLeft(newPlan[0].duration);
    setTotalDurationForProgress(newPlan[0].duration);
    setIsActive(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Completed current block
      const playNotificationSound = () => {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          const playTone = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
          };
          playTone(523.25, 0, 0.4);
          playTone(659.25, 0.15, 0.6);
        } catch (e) {
          console.error('Audio playback failed', e);
        }
      };

      playNotificationSound();

      (async () => {
        try {
          const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/plugin-notification');
          let permissionGranted = await isPermissionGranted();
          if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
          }
          if (permissionGranted) {
            const title = isPlannedMode
              ? `Study Planner: Step ${currentStep + 1} Finished!`
              : 'Pomodoro Timer Finished!';
            const bodyText = isPlannedMode
              ? `Time for a ${plan[currentStep]?.type === 'work' ? 'break' : 'focus session'}!`
              : `Time for a ${mode === 'pomodoro' ? 'break' : 'work'}!`;
            sendNotification({ title, body: bodyText, sound: 'default' });
          }
        } catch (e) {
          console.warn('Notification plugin unavailable:', e);
        }
      })();

      if (isPlannedMode) {
        const nextStep = currentStep + 1;
        if (nextStep < plan.length) {
          setCurrentStep(nextStep);
          setTimeLeft(plan[nextStep].duration);
          setTotalDurationForProgress(plan[nextStep].duration);
        } else {
          setIsActive(false); // Plan exhausted
        }
      } else {
        setIsActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, isPlannedMode, plan, currentStep]);

  // Broadcast state to mini window — moved below currentDisplayType declaration


  // Listen for toggle commands from the mini window
  useEffect(() => {
    const handler = () => setIsActive((a) => !a);
    window.addEventListener('pomodoro-toggle', handler);
    return () => window.removeEventListener('pomodoro-toggle', handler);
  }, []);

  useEffect(() => {
    onTimerStateChange?.(isActive && timeLeft > 0);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (isPlannedMode) {
      if (plan.length > 0) {
        setCurrentStep(0);
        setTimeLeft(plan[0].duration);
        setTotalDurationForProgress(plan[0].duration);
      } else {
        setTimeLeft(focusMinutes * 60);
        setTotalDurationForProgress(focusMinutes * 60);
      }
    } else {
      setTimeLeft(MODE_TIMES[mode]);
      setTotalDurationForProgress(MODE_TIMES[mode]);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODE_TIMES[newMode]);
    setTotalDurationForProgress(MODE_TIMES[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Prevent NaN or Infinity when totalDuration is 0
  const denom = totalDurationForProgress || 1;
  const progress = ((denom - timeLeft) / denom) * 100;

  const currentDisplayType = isPlannedMode
    ? (plan.length > 0 ? plan[currentStep].type : 'work')
    : (mode === 'pomodoro' ? 'work' : 'break');

  // Broadcast state to mini window whenever timer changes
  useEffect(() => {
    const state: TimerState = {
      timeLeft,
      totalDuration: totalDurationForProgress,
      isActive: isActive && timeLeft > 0,
      displayType: currentDisplayType as 'work' | 'break',
    };
    onStateChange?.(state);
  }, [timeLeft, isActive, totalDurationForProgress, currentDisplayType]);


  return (
    <motion.div
      key="pomodoro"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center flex-1 w-full max-w-3xl mx-auto h-full px-4"
    >
      {/* Mode Switcher */}
      <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-2xl mb-8 w-full max-w-sm">
        <button
          onClick={() => {
            setIsPlannedMode(false);
            if (!isActive) {
              setTimeLeft(MODE_TIMES[mode]);
              setTotalDurationForProgress(MODE_TIMES[mode]);
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl transition-all ${!isPlannedMode ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
        >
          <Zap className="w-4 h-4" /> Quick Timer
        </button>
        <button
          onClick={() => {
            setIsPlannedMode(true);
            if (!isActive) {
              if (plan.length > 0) {
                setTimeLeft(plan[currentStep].duration);
                setTotalDurationForProgress(plan[currentStep].duration);
              } else {
                setTimeLeft(focusMinutes * 60);
                setTotalDurationForProgress(focusMinutes * 60);
              }
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl transition-all ${isPlannedMode ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
        >
          <ListTodo className="w-4 h-4" /> Planned Session
        </button>
      </div>

      <div className="flex flex-col items-center gap-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-12 shadow-2xl shadow-emerald-500/5 relative overflow-hidden w-full">
        {/* Progress Background */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-linear z-0"
          style={{ height: `${progress}%`, backgroundColor: currentDisplayType === 'work' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}
        />

        <div className="relative z-10 flex flex-col items-center gap-10 w-full">
          {!isPlannedMode ? (
            <div className="flex bg-zinc-100 dark:bg-zinc-950 p-2 rounded-full shadow-inner border border-zinc-200 dark:border-zinc-800 w-full max-w-lg">
              {(['pomodoro', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-full text-sm font-bold tracking-wider transition-all ${mode === m
                      ? 'bg-emerald-500 text-zinc-950 shadow-md transform scale-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                    }`}
                >
                  {m === 'pomodoro' && <Briefcase className="w-4 h-4" />}
                  {m !== 'pomodoro' && <Coffee className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {m === 'pomodoro' ? 'Focus Work' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full flex justify-center relative min-h-[60px]">
              {plan.length === 0 ? (
                <form onSubmit={generatePlan} className="bg-zinc-100 dark:bg-zinc-950 p-6 rounded-3xl w-full max-w-md flex flex-col gap-4 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-center text-zinc-500">Plan your session</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Total Min
                      <input type="number" min={1} value={totalMinutes} onChange={(e) => setTotalMinutes(Number(e.target.value))} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    </label>
                    <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Focus Min
                      <input type="number" min={1} value={focusMinutes} onChange={(e) => setFocusMinutes(Number(e.target.value))} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    </label>
                    <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Break Min
                      <input type="number" min={1} value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    </label>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
                    <ListTodo className="w-4 h-4" /> Generate & Start
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 max-w-[200px] flex-wrap justify-center overflow-hidden">
                    {plan.map((step, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${idx < currentStep ? 'bg-zinc-300 dark:bg-zinc-800' :
                            idx === currentStep ? (currentDisplayType === 'work' ? 'bg-emerald-500 scale-125' : 'bg-amber-500 scale-125') :
                              'bg-zinc-200 dark:bg-zinc-800/50'
                          }`}
                        title={`Step ${idx + 1}: ${step.type}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span className={currentDisplayType === 'work' ? 'text-emerald-500' : ''}>Work</span>
                    <span className={currentDisplayType === 'break' ? 'text-amber-500' : ''}>Break</span>
                    <span>Step {currentStep + 1} of {plan.length}</span>
                  </div>
                  <button onClick={() => { setPlan([]); setIsActive(false); setTimeLeft(focusMinutes * 60); setTotalDurationForProgress(focusMinutes * 60); }} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors underline decoration-dotted underline-offset-4">
                    Clear Plan
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`text-[7rem] sm:text-[9rem] font-black tracking-tighter tabular-nums leading-none my-4 drop-shadow-sm flex items-center justify-center transition-colors ${currentDisplayType === 'work' ? 'text-zinc-900 dark:text-zinc-100' : 'text-amber-600 dark:text-amber-500'}`}>
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTimer}
              disabled={isPlannedMode && plan.length === 0}
              className={`flex items-center justify-center w-24 h-24 rounded-full transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${isActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : (isPlannedMode && plan.length === 0) ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                }`}
            >
              {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
            </button>
            <button
              onClick={resetTimer}
              disabled={isPlannedMode && plan.length === 0}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-all active:scale-95 shadow-lg border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:active:scale-100"
            >
              <RotateCcw className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
