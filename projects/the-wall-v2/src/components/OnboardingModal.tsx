import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User } from 'lucide-react';

export interface UserProfile {
  name: string;
  title: string;
}

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

const TITLES = [
  "The Architect",
  "The Enforcer",
  "The Visionary",
  "The Incredible",
  "The Mastermind",
  "The Maverick"
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState(TITLES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onComplete({ name: name.trim(), title });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 pb-6 flex flex-col gap-2">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Welcome to The Wall</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Let's get to know you before you start organizing your life.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-0 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                maxLength={40}
                placeholder="e.g. Ozymandias"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Choose your title</label>
            <select
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            >
              {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-zinc-950 font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Enter The Wall
          </button>
        </form>
      </motion.div>
    </div>
  );
}
