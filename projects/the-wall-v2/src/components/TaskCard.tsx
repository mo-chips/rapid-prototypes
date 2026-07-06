import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, Calendar, AlertCircle, Repeat, ChevronDown, Plus, X, StickyNote } from 'lucide-react';
import { Task, Note } from '../types';

interface TaskCardProps {
  key?: string;
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask?: (taskId: string, text: string, dueDate?: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  allNotes?: Note[];
  onOpenNote?: (note: Note) => void;
  onCreateNote?: (forTask: Task) => void;
}

const priorityColors = {
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  allNotes = [],
  onOpenNote,
  onCreateNote,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const isValidDate = task.dueDate && !isNaN(new Date(task.dueDate).getTime());
  const dateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = isValidDate && dateObj ? dateObj < new Date() : false;

  const formattedDate = isValidDate && dateObj ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(dateObj) : null;

  const getCurrentLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleDueDateChange = (val: string) => {
    const minVal = getCurrentLocalDateTime();
    if (val && val < minVal) setNewSubtaskDueDate(minVal);
    else setNewSubtaskDueDate(val);
  };

  const handleStartAdding = () => {
    setExpanded(true);
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim() && onAddSubtask) {
      onAddSubtask(task.id, newSubtaskText.trim(), newSubtaskDueDate || undefined);
      setNewSubtaskText('');
      setNewSubtaskDueDate('');
      setAdding(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all shadow-lg shadow-black/5 dark:shadow-black/10 ${
        task.completed ? 'opacity-60 grayscale-[0.5]' : ''
      } ${isOverdue && !task.completed ? 'border-rose-500/50' : ''}`}
    >
      {/* Main row */}
      <div className="p-4 flex items-center gap-4 relative">
        {/* Done checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white dark:text-zinc-950'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 group-hover:bg-emerald-500/5'
          }`}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Text + meta */}
        <div className="flex-1 min-w-0">
          <p className={`text-zinc-900 dark:text-zinc-100 font-medium truncate transition-all ${
            task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
          }`}>
            {task.text}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.recurrence && task.recurrence !== 'none' && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                <Repeat className="w-3 h-3" />
                <span>{task.recurrence}</span>
              </div>
            )}
            {isOverdue && !task.completed && (
              <div className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            )}
            {subtasks.length > 0 && (
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {completedSubtasks}/{subtasks.length} subtasks
              </span>
            )}
          </div>

          {/* Subtask progress bar */}
          {subtasks.length > 0 && (
            <div className="mt-2 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          )}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Add subtask */}
          {!task.completed && (
            <button
              onClick={handleStartAdding}
              title="Add subtask"
              className="p-2 rounded-lg hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Expand/collapse */}
          {subtasks.length > 0 && (
            <button
              onClick={() => {
                setExpanded(v => !v);
                if (adding) setAdding(false);
              }}
              className={`p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </button>
          )}

          {/* Delete task */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {task.priority === 'high' && !task.completed && (
          <div className="absolute top-0 right-0 p-1">
            <AlertCircle className="w-3 h-3 text-rose-500/50" />
          </div>
        )}
      </div>

      {/* Subtask drawer */}
      <AnimatePresence initial={false}>
        {(expanded || adding) && (
          <motion.div
            key="subtasks"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 flex flex-col gap-2">
              {subtasks.map((sub) => {
                const isValidSubDate = sub.dueDate && !isNaN(new Date(sub.dueDate).getTime());
                const subDateObj = sub.dueDate ? new Date(sub.dueDate) : null;
                const isSubOverdue = isValidSubDate && subDateObj ? subDateObj < new Date() : false;

                return (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`group/sub flex items-center gap-3 p-1.5 rounded-xl transition-colors ${isSubOverdue && !sub.completed ? 'bg-rose-500/5 border border-rose-500/20' : 'border border-transparent'}`}
                >
                  {/* Subtask checkbox */}
                  <button
                    onClick={() => onToggleSubtask?.(task.id, sub.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      sub.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white dark:text-zinc-950'
                        : isSubOverdue ? 'border-rose-300 dark:border-rose-700 hover:border-rose-500 bg-rose-500/10' : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                    }`}
                  >
                    {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>

                  <div className={`flex-1 min-w-0 flex flex-col ${sub.completed ? 'opacity-60' : ''}`}>
                    <span className={`text-sm truncate ${sub.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : isSubOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {sub.text}
                    </span>
                    {sub.dueDate && (
                      <span className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${isSubOverdue && !sub.completed ? 'text-rose-500' : 'text-zinc-500'}`}>
                        {isSubOverdue && !sub.completed ? <AlertCircle className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(sub.dueDate))}
                      </span>
                    )}
                  </div>

                  {/* Delete subtask */}
                  <button
                    onClick={() => onDeleteSubtask?.(task.id, sub.id)}
                    className="p-0.5 rounded text-zinc-300 dark:text-zinc-700 hover:text-rose-500 transition-colors opacity-0 group-hover/sub:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )})}

              {/* Inline add subtask */}
              {adding && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 mt-1 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-dashed border-zinc-300 dark:border-zinc-700 shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); }
                        if (e.key === 'Escape') { setAdding(false); setNewSubtaskText(''); setNewSubtaskDueDate(''); }
                      }}
                      placeholder="Add a subtask…"
                      className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none border-b border-zinc-200/50 dark:border-zinc-700/50 focus:border-emerald-500 pb-0.5 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="datetime-local"
                      value={newSubtaskDueDate}
                      min={getCurrentLocalDateTime()}
                      onChange={(e) => handleDueDateChange(e.target.value)}
                      className="flex-1 bg-transparent border-none text-[10px] text-zinc-500 outline-none focus:text-emerald-500 dark:[color-scheme:dark]"
                    />
                    <button
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskText.trim()}
                      className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-zinc-950 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setAdding(false); setNewSubtaskText(''); setNewSubtaskDueDate(''); }}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* "Add subtask" link when expanded but not in add mode */}
              {!adding && !task.completed && (
                <button
                  onClick={handleStartAdding}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-emerald-500 font-semibold uppercase tracking-wider transition-colors mt-1 self-start"
                >
                  <Plus className="w-3 h-3" />
                  Add subtask
                </button>
              )}

              {/* Linked Notes */}
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Linked Notes</span>
                  {!task.completed && (
                    <button
                      onClick={() => onCreateNote?.(task)}
                      className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-emerald-500 font-semibold uppercase tracking-wider transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      New Note
                    </button>
                  )}
                </div>
                {task.linkedNoteIds && task.linkedNoteIds.map(noteId => {
                  const noteObj = allNotes.find(n => n.id === noteId);
                  if (!noteObj) return null;
                  return (
                    <button
                      key={noteId}
                      onClick={() => onOpenNote?.(noteObj)}
                      className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700/80 shadow-sm hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    >
                      <StickyNote className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate max-w-[200px] font-medium">{noteObj.title || 'Untitled Note'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
