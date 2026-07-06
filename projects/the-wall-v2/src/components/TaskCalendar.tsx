import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '../types';

interface TaskCalendarProps {
  tasks: Task[];
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthYearStr = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  type CalendarItem = { id: string; type: 'task' | 'subtask'; priority: Task['priority']; text: string; completed: boolean; dueDate: string };

  // Compute tasks per day in current month
  const tasksByDay = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();
    tasks.forEach(task => {
      // Add main task
      if (task.dueDate && !task.completed) {
        const d = new Date(task.dueDate);
        if (d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth()) {
          const dateStr = d.getDate();
          if (!map.has(dateStr)) map.set(dateStr, []);
          map.get(dateStr)!.push({ id: task.id, type: 'task', priority: task.priority, text: task.text, completed: task.completed, dueDate: task.dueDate });
        }
      }
      // Add subtasks
      task.subtasks?.forEach(sub => {
        if (sub.dueDate && !sub.completed) {
          const sd = new Date(sub.dueDate);
          if (sd.getFullYear() === currentDate.getFullYear() && sd.getMonth() === currentDate.getMonth()) {
            const dateStr = sd.getDate();
            if (!map.has(dateStr)) map.set(dateStr, []);
            map.get(dateStr)!.push({ id: sub.id, type: 'subtask', priority: task.priority, text: sub.text, completed: sub.completed, dueDate: sub.dueDate });
          }
        }
      });
    });
    return map;
  }, [tasks, currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  // Empty cells for the start of the week
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl shadow-black/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{monthYearStr}</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 pb-2">
            {day}
          </div>
        ))}

        {days.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={`empty-${i}`} className="min-h-[60px] p-2 rounded-xl" />;
          }

          const dayTasks = tasksByDay.get(dayNum) || [];
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).toDateString();

          return (
            <motion.div
              key={dayNum}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`min-h-[60px] p-2 rounded-xl flex flex-col gap-1 border transition-all ${
                isToday
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800/50'
              }`}
            >
              <span className={`text-xs font-bold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {dayNum}
              </span>
              {dayTasks.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto items-center">
                  {dayTasks.map(t => (
                    <div
                      key={t.id}
                      className={`${t.type === 'subtask' ? 'w-1.5 h-1.5 rounded-[1px]' : 'w-3 h-3 rounded-full'} ${
                        t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      title={`${t.type === 'subtask' ? 'Subtask: ' : ''}${t.text}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
