import { motion } from 'motion/react';
import { Trash2, Edit3, Tag, Clock, CheckSquare } from 'lucide-react';
import { Note, Task } from '../types';

interface NoteCardProps {
  key?: string;
  note: Note;
  allTasks?: Task[];
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onTagClick?: (tag: string) => void;
  onCreateTask?: (forNote: Note) => void;
}

export function NoteCard({ note, allTasks = [], onDelete, onEdit, onTagClick, onCreateTask }: NoteCardProps) {
  let formattedDate = 'Unknown date';
  try {
    const dateObj = note.updatedAt ? new Date(note.updatedAt) : new Date();
    if (!isNaN(dateObj.getTime())) {
      formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);
    }
  } catch (e) {
    console.error('Invalid date format for note', note);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-emerald-500/30 transition-all shadow-xl shadow-black/5 dark:shadow-black/20 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
      
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 flex-1 group-hover:text-emerald-500 transition-colors">
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(note.linkedTaskIds && note.linkedTaskIds.length > 0) || onCreateTask ? (
        <div className="flex flex-col gap-1.5 -mt-2 mb-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Linked Tasks</span>
            <button
              onClick={(e) => { e.stopPropagation(); onCreateTask?.(note); }}
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-emerald-500 font-semibold uppercase tracking-wider transition-colors"
            >
              <CheckSquare className="w-3 h-3" />
              New Task
            </button>
          </div>
          {note.linkedTaskIds && note.linkedTaskIds.map(taskId => {
            const task = allTasks.find(t => t.id === taskId);
            if (!task) return null;
            return (
              <div key={taskId} className={`flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-800/80 shadow-sm ${
                task.completed ? 'opacity-50 line-through' : ''
              }`}>
                <CheckSquare className={`w-3 h-3 shrink-0 ${task.completed ? 'text-zinc-400' : 'text-emerald-500'}`} />
                <span className="truncate max-w-[200px] font-medium">{task.text}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed flex-1">
        {note.content || 'No content...'}
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {note.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 text-[10px] font-semibold uppercase tracking-wider rounded-md flex items-center gap-1 hover:scale-105 hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 transition-all cursor-pointer"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-600 font-medium uppercase tracking-widest mt-2">
        <Clock className="w-3 h-3" />
        <span>Updated {formattedDate}</span>
      </div>
    </motion.div>
  );
}
