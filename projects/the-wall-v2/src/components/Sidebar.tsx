import { motion } from 'motion/react';
import { StickyNote, CheckSquare, Settings, LayoutDashboard, Plus, Timer } from 'lucide-react';

interface SidebarProps {
  activeTab: 'notes' | 'tasks' | 'dashboard' | 'pomodoro' | 'settings';
  setActiveTab: (tab: 'notes' | 'tasks' | 'dashboard' | 'pomodoro' | 'settings') => void;
  onAdd: () => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'notes', icon: StickyNote, label: 'Notes' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'pomodoro', icon: Timer, label: 'Pomodoro' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeTab, setActiveTab, onAdd }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 gap-6">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-zinc-950 font-bold text-xl leading-none">W</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">The Wall <span className="text-emerald-500">v2</span></h1>
      </div>



      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${activeTab === item.id ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900'
              }`}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'}`} />
            <span className="font-medium relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
