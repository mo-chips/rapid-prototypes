import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, AlertCircle, Trash2, StickyNote } from 'lucide-react';
import { Task, Note } from '../types';

interface TaskEditorProps {
  allNotes: Note[];
  initialLinkedNoteId?: string;
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
}

export function TaskEditor({ allNotes, initialLinkedNoteId, onSave, onClose }: TaskEditorProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>(
    initialLinkedNoteId ? [initialLinkedNoteId] : []
  );
  
  const getCurrentLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleDueDateChange = (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const minVal = getCurrentLocalDateTime();
    if (val && val < minVal) setter(minVal);
    else setter(val);
  };
  const [recurrence, setRecurrence] = useState<Task['recurrence']>('none');
  const [subtasks, setSubtasks] = useState<{ id: string; text: string; completed: boolean; dueDate?: string }[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState<string>('');

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: Math.random().toString(36).substring(2, 9),
          text: newSubtaskText.trim(),
          completed: false,
          dueDate: newSubtaskDueDate || undefined,
        },
      ]);
      setNewSubtaskText('');
      setNewSubtaskDueDate('');
    }
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave({
        text: text.trim(),
        priority,
        dueDate,
        recurrence,
        completed: false,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        linkedNoteIds,
      });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Task Description</label>
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Priority</label>
              <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      priority === p
                        ? p === 'high' ? 'bg-rose-500 text-white dark:text-zinc-950' : p === 'medium' ? 'bg-amber-500 text-white dark:text-zinc-950' : 'bg-emerald-500 text-white dark:text-zinc-950'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Due Date</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={dueDate}
                  min={getCurrentLocalDateTime()}
                  onChange={(e) => handleDueDateChange(e.target.value, setDueDate)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all dark:[color-scheme:dark]"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Recurrence</label>
            <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
              {(['none', 'daily', 'weekly', 'monthly'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurrence(r)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    recurrence === r
                      ? 'bg-emerald-500 text-white dark:text-zinc-950 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Subtasks (Optional)</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a subtask..."
                  className="flex-1 w-full sm:w-auto bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <input
                  type="datetime-local"
                  value={newSubtaskDueDate}
                  min={getCurrentLocalDateTime()}
                  onChange={(e) => handleDueDateChange(e.target.value, setNewSubtaskDueDate)}
                  className="w-full sm:w-40 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all dark:[color-scheme:dark]"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskText.trim()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-lg transition-all shrink-0 sm:ml-auto"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {subtasks.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2">
                      <div className="w-4 h-4 rounded border-2 border-zinc-300 dark:border-zinc-700 shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{sub.text}</span>
                        {sub.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(sub.dueDate))}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(sub.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Linked Notes</label>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {linkedNoteIds.map((noteId) => {
                  const noteObj = allNotes.find(n => n.id === noteId);
                  if (!noteObj) return null;
                  return (
                  <motion.span
                    key={noteId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold rounded-lg flex items-center gap-2 group max-w-[200px]"
                  >
                    <StickyNote className="w-3 h-3 shrink-0" />
                    <span className="truncate">{noteObj.title || 'Untitled'}</span>
                    <button
                      type="button"
                      onClick={() => setLinkedNoteIds(linkedNoteIds.filter(id => id !== noteId))}
                      className="p-0.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0 whitespace-nowrap"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.span>
                )})}
              </AnimatePresence>
              {allNotes.filter(n => !linkedNoteIds.includes(n.id)).length > 0 && (
                <select
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none max-w-[200px]"
                  onChange={(e) => {
                    if (e.target.value) {
                      setLinkedNoteIds([...linkedNoteIds, e.target.value]);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled hidden>Link existing note...</option>
                  {allNotes.filter(n => !linkedNoteIds.includes(n.id)).map(n => (
                    <option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-[10px] text-zinc-500 italic">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p>Tasks are stored locally and will persist until cleared.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 font-semibold dark:hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
