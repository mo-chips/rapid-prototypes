import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Tag, Plus, Trash2, CheckSquare } from 'lucide-react';
import { Note, Task } from '../types';

interface NoteEditorProps {
  note: Note | null;
  availableTags: string[];
  allTasks: Task[];
  initialLinkedTaskId?: string;
  onSave: (note: Partial<Note>) => void;
  onClose: () => void;
}

export function NoteEditor({ note, availableTags, allTasks, initialLinkedTaskId, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(
    initialLinkedTaskId
      ? Array.from(new Set([...(note?.linkedTaskIds || []), initialLinkedTaskId]))
      : (note?.linkedTaskIds || [])
  );

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setLinkedTaskIds(note.linkedTaskIds || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setLinkedTaskIds([]);
    }
  }, [note]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    onSave({
      title,
      content,
      tags,
      linkedTaskIds,
    });
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
        className="w-full max-w-4xl h-[85vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">{note ? 'Edit Note' : 'Create New Note'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-6 custom-scrollbar">
          <div className="flex flex-col">
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full bg-transparent py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:outline-none transition-all text-4xl sm:text-5xl font-black tracking-tight"
            />
          </div>

          <div className="flex flex-col flex-1 min-h-[30vh]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your ideas..."
              className="w-full h-full bg-transparent py-4 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none transition-all resize-none text-lg leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-500 text-xs font-semibold rounded-lg flex items-center gap-2 group"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <form onSubmit={handleAddTag} className="flex-1 min-w-[200px] flex gap-2">
                {availableTags.filter(t => !tags.includes(t)).length > 0 && (
                  <select
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none max-w-[140px]"
                    onChange={(e) => {
                      if (e.target.value) {
                        setTags([...tags, e.target.value]);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled hidden>Add existing...</option>
                    <option value="" disabled className="text-zinc-400">Select tag</option>
                    {availableTags.filter(t => !tags.includes(t)).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Type new tag..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all pr-8"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-emerald-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mt-4">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Linked Tasks</label>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {linkedTaskIds.map((taskId) => {
                  const taskObj = allTasks.find(t => t.id === taskId);
                  if (!taskObj) return null;
                  return (
                  <motion.span
                    key={taskId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold rounded-lg flex items-center gap-2 group"
                  >
                    <CheckSquare className="w-3 h-3" />
                    {taskObj.text}
                    <button
                      type="button"
                      onClick={() => setLinkedTaskIds(linkedTaskIds.filter(id => id !== taskId))}
                      className="p-0.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.span>
                )})}
              </AnimatePresence>
              {allTasks.filter(t => !linkedTaskIds.includes(t.id)).length > 0 && (
                <select
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none max-w-[200px]"
                  onChange={(e) => {
                    if (e.target.value) {
                      setLinkedTaskIds([...linkedTaskIds, e.target.value]);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled hidden>Link existing task...</option>
                  {allTasks.filter(t => !linkedTaskIds.includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.text}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 font-semibold dark:hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
          >
            <Save className="w-5 h-5" />
            <span>Save Note</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
