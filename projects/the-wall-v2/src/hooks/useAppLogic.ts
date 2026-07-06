import { useState, useMemo, useEffect } from 'react';
import { useTauriStorage } from './useTauriStorage';
import { useNotifications } from './useNotifications';
import { Note, Task, Subtask } from '../types';

export interface UserProfile {
  name: string;
  title: string;
}

export function useAppLogic() {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'dashboard' | 'pomodoro' | 'settings'>('dashboard');
  const [notes, setNotes] = useTauriStorage<Note[]>('the-wall-notes', []);
  const [tasks, setTasks] = useTauriStorage<Task[]>('the-wall-tasks', []);
  const [profile, setProfile, profileLoaded] = useTauriStorage<UserProfile | null>('the-wall-profile', null);
  const [theme, setTheme, themeLoaded] = useTauriStorage<'dark' | 'light'>('the-wall-theme', 'dark');
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Handle Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dashboard Stats
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const recentNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.completed).length;

    return { totalNotes, totalTasks, completedTasks, pendingTasks, recentNotes, highPriorityTasks };
  }, [notes, tasks]);

  // Filtering
  const filteredNotes = useMemo(() => {
    return notes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t =>
      t.text.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, searchQuery]);

  // Handlers
  const handleAddEntry = () => {
    if (activeTab === 'tasks') setIsTaskEditorOpen(true);
    else setIsNoteEditorOpen(true);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    const noteId = editingNote ? editingNote.id : Math.random().toString(36).substring(2, 9);
    const linkedTaskIds = noteData.linkedTaskIds || [];
    
    const linkedTasks = tasks.filter(t => linkedTaskIds.includes(t.id));
    const taskTags = linkedTasks.map(t => t.text);
    const baseTags = noteData.tags || [];
    const mergedTags = Array.from(new Set([...baseTags, ...taskTags]));

    if (editingNote) {
      setNotes(notes.map(n => n.id === noteId ? { ...n, ...noteData, tags: mergedTags, linkedTaskIds, updatedAt: Date.now() } : n));
      addNotification('Note updated successfully', 'success');
    } else {
      const newNote: Note = {
        id: noteId,
        title: noteData.title || '',
        content: noteData.content || '',
        tags: mergedTags,
        linkedTaskIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes([newNote, ...notes]);
      addNotification('New note created', 'success');
    }

    // Sync backward references on all tasks:
    // - Add noteId to newly linked tasks
    // - Remove noteId from de-linked tasks
    const prevLinkedTaskIds = editingNote?.linkedTaskIds || [];
    const addedTaskIds = linkedTaskIds.filter(id => !prevLinkedTaskIds.includes(id));
    const removedTaskIds = prevLinkedTaskIds.filter(id => !linkedTaskIds.includes(id));

    if (addedTaskIds.length > 0 || removedTaskIds.length > 0) {
        setTasks(prevTasks => prevTasks.map(t => {
            if (addedTaskIds.includes(t.id)) {
                return { ...t, linkedNoteIds: Array.from(new Set([...(t.linkedNoteIds || []), noteId])) };
            }
            if (removedTaskIds.includes(t.id)) {
                return { ...t, linkedNoteIds: (t.linkedNoteIds || []).filter(nid => nid !== noteId) };
            }
            return t;
        }));
    }

    setIsNoteEditorOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    addNotification('Note deleted', 'warning');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    const taskId = Math.random().toString(36).substring(2, 9);
    const linkedNoteIds = taskData.linkedNoteIds || [];

    const newTask: Task = {
      id: taskId,
      text: taskData.text || '',
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate!,
      createdAt: Date.now(),
      recurrence: taskData.recurrence,
      subtasks: taskData.subtasks || [],
      linkedNoteIds,
    };
    setTasks([newTask, ...tasks]);
    addNotification('Task added to list', 'success');

    if (linkedNoteIds.length > 0) {
        setNotes(prevNotes => prevNotes.map(n => {
            if (linkedNoteIds.includes(n.id)) {
                return { 
                    ...n, 
                    tags: Array.from(new Set([...n.tags, newTask.text])), 
                    linkedTaskIds: Array.from(new Set([...(n.linkedTaskIds || []), taskId])), 
                    updatedAt: Date.now() 
                };
            }
            return n;
        }));
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.flatMap(t => {
      if (t.id === id) {
        if (!t.completed && t.recurrence && t.recurrence !== 'none') {
          const newDueDate = t.dueDate ? new Date(t.dueDate) : new Date();
          if (t.recurrence === 'daily') newDueDate.setDate(newDueDate.getDate() + 1);
          if (t.recurrence === 'weekly') newDueDate.setDate(newDueDate.getDate() + 7);
          if (t.recurrence === 'monthly') newDueDate.setMonth(newDueDate.getMonth() + 1);
          
          const nextTask: Task = {
            ...t,
            id: Math.random().toString(36).substring(2, 9),
            dueDate: newDueDate.toISOString().slice(0, 16),
            createdAt: Date.now()
          };
          
          return [{ ...t, completed: true }, nextTask];
        }
        return [{ ...t, completed: !t.completed }];
      }
      return [t];
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    addNotification('Task removed', 'warning');
  };

  const handleAddSubtask = (taskId: string, text: string, dueDate?: string) => {
    const newSubtask: Subtask = {
      id: Math.random().toString(36).substring(2, 9),
      text: text.trim(),
      completed: false,
      dueDate,
    };
    setTasks(tasks.map(t => t.id === taskId
      ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] }
      : t
    ));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => t.id === taskId
      ? {
          ...t,
          subtasks: (t.subtasks || []).map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
        }
      : t
    ));
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => t.id === taskId
      ? { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) }
      : t
    ));
  };

  return {
    activeTab,
    setActiveTab,
    notes,
    setNotes,
    tasks,
    setTasks,
    notifications,
    addNotification,
    removeNotification,
    searchQuery,
    setSearchQuery,
    isNoteEditorOpen,
    setIsNoteEditorOpen,
    isTaskEditorOpen,
    setIsTaskEditorOpen,
    editingNote,
    setEditingNote,
    viewMode,
    setViewMode,
    stats,
    filteredNotes,
    filteredTasks,
    handleAddEntry,
    handleSaveNote,
    handleDeleteNote,
    handleEditNote,
    handleSaveTask,
    handleToggleTask,
    handleDeleteTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
    profile,
    setProfile,
    profileLoaded,
    theme,
    setTheme
  };
}
