import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, LayoutGrid, List as ListIcon, Plus, StickyNote, CheckSquare, Clock, TrendingUp, X, Maximize2, Move, Minus } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { listen, emit, UnlistenFn } from '@tauri-apps/api/event';
import type { TimerState } from './components/MiniTimerWindow';
import { useAppLogic } from './hooks/useAppLogic';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { TaskCard } from './components/TaskCard';
import { NoteEditor } from './components/NoteEditor';
import { TaskEditor } from './components/TaskEditor';
import { TaskCalendar } from './components/TaskCalendar';
import { PomodoroTimer } from './components/PomodoroTimer';
import { NotificationToast } from './components/NotificationToast';
import { OnboardingModal } from './components/OnboardingModal';
import { Note, Task } from './types';

export default function App() {
  const {
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
  } = useAppLogic();

  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Cross-linking handlers
  const handleOpenNote = (note: Note) => {
    setActiveTab('notes');
    handleEditNote(note);
  };

  const handleCreateNoteForTask = (forTask: Task) => {
    setActiveTab('notes');
    // Pre-link the task: open note editor (useAppLogic will handle saving the link)
    setIsNoteEditorOpen(true);
    // We store the task id to pre-populate in NoteEditor via editingNote trick
    // Instead, we pass it via a separate piece of state
    setPendingLinkedTaskId(forTask.id);
  };

  const handleCreateTaskForNote = (forNote: Note) => {
    setActiveTab('tasks');
    setIsTaskEditorOpen(true);
    setPendingLinkedNoteId(forNote.id);
  };

  const [pendingLinkedTaskId, setPendingLinkedTaskId] = useState<string | null>(null);
  const [pendingLinkedNoteId, setPendingLinkedNoteId] = useState<string | null>(null);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [notes]);

  const [isPomodoroTicking, setIsPomodoroTicking] = useState(false);
  const timerStateRef = useRef<TimerState | null>(null);

  const tickingRef = useRef(isPomodoroTicking);
  useEffect(() => {
    tickingRef.current = isPomodoroTicking;
  }, [isPomodoroTicking]);

  // Spawn / tear-down the separate mini-timer window
  const miniWindowRef = useRef<WebviewWindow | null>(null);

  const spawnMiniWindow = async () => {
    // Close any existing mini window first
    if (miniWindowRef.current) {
      try { await miniWindowRef.current.close(); } catch {}
      miniWindowRef.current = null;
    }

    // Always mirror the exact origin the main window loaded from.
    // In dev this picks up whatever port Vite actually used (3000 or 3001).
    const miniUrl = `${window.location.origin}/?mini=true`;

    const win = new WebviewWindow('mini-timer', {
      url: miniUrl,
      title: 'Pomodoro Timer',
      width: 280,
      height: 160,
      resizable: false,
      decorations: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      focus: false,
    });

    miniWindowRef.current = win;

    // When the mini window is ready, push current timer state to it
    win.once('tauri://created', async () => {
      // Give React a tick to mount then push state
      setTimeout(() => {
        if (timerStateRef.current) {
          emit('timer-state-update', timerStateRef.current);
        }
      }, 300);
    });
  };

  const closeMiniWindow = async () => {
    if (miniWindowRef.current) {
      try { await miniWindowRef.current.close(); } catch {}
      miniWindowRef.current = null;
    }
  };

  useEffect(() => {
    let unlistenClose: UnlistenFn | undefined;
    let unlistenRestore: UnlistenFn | undefined;
    let unlistenReady: UnlistenFn | undefined;
    let unlistenControl: UnlistenFn | undefined;

    const setupListeners = async () => {
      // Only register Tauri event listeners when running inside the desktop app
      if (!('__TAURI_INTERNALS__' in window)) return;
      // Native X button → hide or show mini
      unlistenClose = await listen('app-close-requested', async () => {
        const appWindow = getCurrentWindow();
        if (tickingRef.current) {
          await appWindow.hide();
          await spawnMiniWindow();
        } else {
          await appWindow.hide();
        }
      });

      // Tray / system restore
      unlistenRestore = await listen('app-restore-requested', async () => {
        await closeMiniWindow();
        const appWindow = getCurrentWindow();
        await appWindow.show();
        await appWindow.setFocus();
      });

      // Mini window just mounted — send it the current state
      unlistenReady = await listen('mini-timer-ready', () => {
        if (timerStateRef.current) {
          emit('timer-state-update', timerStateRef.current);
        }
      });

      // Mini window sent us a control command
      unlistenControl = await listen<{ action: string }>('mini-timer-control', async (e) => {
        const { action } = e.payload;
        if (action === 'toggle') {
          // Dispatch a synthetic event the PomodoroTimer listens for
          window.dispatchEvent(new CustomEvent('pomodoro-toggle'));
        } else if (action === 'maximize') {
          await closeMiniWindow();
          const appWindow = getCurrentWindow();
          await appWindow.show();
          await appWindow.setFocus();
        } else if (action === 'hide') {
          await closeMiniWindow();
        }
      });
    };

    setupListeners();

    return () => {
      unlistenClose?.();
      unlistenRestore?.();
      unlistenReady?.();
      unlistenControl?.();
    };
  }, []);

  const finalFilteredNotes = useMemo(() => {
    if (!activeTagFilter) return filteredNotes;
    return filteredNotes.filter(n => n.tags.includes(activeTagFilter));
  }, [filteredNotes, activeTagFilter]);

  const initials = profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'TU';

  return (
    <div className="flex font-sans overflow-hidden h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onAdd={handleAddEntry} />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header — full element is the drag region; buttons call stopPropagation */}
        {(
          <header
            className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-950/50 backdrop-blur-md z-10 select-none cursor-move"
            onMouseDown={(e) => {
              // Only drag from the header itself, not from buttons
              if ((e.target as HTMLElement).closest('button')) return;
              getCurrentWindow().startDragging();
            }}
          >
            <div className="flex items-center gap-2 flex-1 h-full font-bold text-xs text-zinc-400">
              THE WALL
            </div>

            <div className="flex items-center gap-3">
              {activeTab === 'notes' && (
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                  <button
                    data-tauri-drag-region="false"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LayoutGrid data-tauri-drag-region="false" className="w-4 h-4" />
                  </button>
                  <button
                    data-tauri-drag-region="false"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <ListIcon data-tauri-drag-region="false" className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="w-px h-6 bg-zinc-800 mx-2" />
              <div className="flex items-center gap-2 pl-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-zinc-950 text-xs shadow-lg shadow-emerald-500/20">
                  {initials}
                </div>
              </div>

              {/* Custom Window Controls */}
              <div className="w-px h-6 bg-zinc-800 mx-2" />
              <div className="flex items-center gap-1">
                <button data-tauri-drag-region="false" onClick={() => getCurrentWindow().minimize()} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <Minus data-tauri-drag-region="false" className="w-4 h-4" />
                </button>
                <button data-tauri-drag-region="false" onClick={() => getCurrentWindow().toggleMaximize()} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <Maximize2 data-tauri-drag-region="false" className="w-4 h-4" />
                </button>
                <button data-tauri-drag-region="false" onClick={() => getCurrentWindow().emit('app-close-requested')} className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <X data-tauri-drag-region="false" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {(
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Welcome back, <span className="text-emerald-500">{profile?.name || 'king'}</span>.</h2>
                    <p className="text-zinc-500">Here's what's happening on your wall today.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Notes', value: stats.totalNotes, icon: StickyNote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Active Tasks', value: stats.pendingTasks, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { label: 'High Priority', value: stats.highPriorityTasks, icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                      { label: 'Completed', value: stats.completedTasks, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl shadow-black/10"
                      >
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                          <p className="text-3xl font-bold text-zinc-100 mt-1">{stat.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-200">Recent Notes</h3>
                        <button onClick={() => setActiveTab('notes')} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">View All</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {stats.recentNotes.length > 0 ? (
                          stats.recentNotes.map(note => (
                            <NoteCard key={note.id} note={note} allTasks={tasks} onDelete={handleDeleteNote} onEdit={handleEditNote} onCreateTask={handleCreateTaskForNote} />
                          ))
                        ) : (
                          <div className="h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600 italic text-sm">
                            No notes yet. Create your first one!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-200">Pending Tasks</h3>
                        <button onClick={() => setActiveTab('tasks')} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">View All</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {tasks.filter(t => !t.completed).slice(0, 5).length > 0 ? (
                          tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                            <TaskCard key={task.id} task={task} allNotes={notes} onToggle={handleToggleTask} onDelete={handleDeleteTask}
                              onAddSubtask={handleAddSubtask} onToggleSubtask={handleToggleSubtask} onDeleteSubtask={handleDeleteSubtask}
                              onOpenNote={handleOpenNote} onCreateNote={handleCreateNoteForTask} />
                          ))
                        ) : (
                          <div className="h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600 italic text-sm">
                            All caught up! No pending tasks.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-100">My Notes</h2>
                      <p className="text-zinc-500 text-sm">Manage your thoughts and ideas.</p>
                    </div>
                    <button
                      onClick={() => setIsNoteEditorOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Note</span>
                    </button>
                  </div>

                  {availableTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTagFilter(null)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${!activeTagFilter ? 'bg-emerald-600 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                      >
                        All
                      </button>
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveTagFilter(tag)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${activeTagFilter === tag ? 'bg-emerald-600 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    <AnimatePresence mode="popLayout">
                      {finalFilteredNotes.map((note) => (
                        <NoteCard key={note.id} note={note} allTasks={tasks} onDelete={handleDeleteNote} onEdit={handleEditNote} onTagClick={setActiveTagFilter} onCreateTask={handleCreateTaskForNote} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {finalFilteredNotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
                      <StickyNote className="w-16 h-16 opacity-20" />
                      <p className="text-lg font-medium italic">No notes found matching your search.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6 max-w-3xl mx-auto w-full"
                >
                  <TaskCalendar tasks={tasks} />

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-100">Task List</h2>
                      <p className="text-zinc-500 text-sm">Stay organized and productive.</p>
                    </div>
                    <button
                      onClick={() => setIsTaskEditorOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                      {filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} allNotes={notes} onToggle={handleToggleTask} onDelete={handleDeleteTask}
                              onAddSubtask={handleAddSubtask} onToggleSubtask={handleToggleSubtask} onDeleteSubtask={handleDeleteSubtask}
                              onOpenNote={handleOpenNote} onCreateNote={handleCreateNoteForTask} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
                      <CheckSquare className="w-16 h-16 opacity-20" />
                      <p className="text-lg font-medium italic">No tasks found. Time to relax?</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-8 max-w-2xl"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-zinc-100">Settings</h2>
                    <p className="text-zinc-500 text-sm">Configure your workspace preferences.</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">General</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-200">Dark Mode</p>
                          <p className="text-xs text-zinc-500">Toggle dark and light themes</p>
                        </div>
                        <button
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </section>

                    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-rose-500">Danger Zone</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-zinc-200">Clear All Data</p>
                          <p className="text-xs text-zinc-500">Permanently delete all notes and tasks</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                              setNotes([]);
                              setTasks([]);
                              setProfile(null);
                              addNotification('All data cleared', 'error');
                            }
                          }}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-zinc-950 font-bold text-xs rounded-xl transition-all border border-rose-500/20"
                        >
                          Reset Wall
                        </button>
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div style={{ display: activeTab === 'pomodoro' ? 'block' : 'none', height: '100%', width: '100%' }}>
            <PomodoroTimer
              onTimerStateChange={setIsPomodoroTicking}
              onStateChange={(state) => {
                timerStateRef.current = state;
                // Keep mini window in sync if open
                if (miniWindowRef.current) {
                  emit('timer-state-update', state);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {(
        <>
          <AnimatePresence>
            {isNoteEditorOpen && (
              <NoteEditor
                note={editingNote}
                availableTags={availableTags}
                allTasks={tasks}
                initialLinkedTaskId={pendingLinkedTaskId || undefined}
                onSave={handleSaveNote}
                onClose={() => {
                  setIsNoteEditorOpen(false);
                  setEditingNote(null);
                  setPendingLinkedTaskId(null);
                }}
              />
            )}
            {isTaskEditorOpen && (
              <TaskEditor
                allNotes={notes}
                initialLinkedNoteId={pendingLinkedNoteId || undefined}
                onSave={handleSaveTask}
                onClose={() => {
                  setIsTaskEditorOpen(false);
                  setPendingLinkedNoteId(null);
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {profileLoaded && !profile && (
              <OnboardingModal onComplete={setProfile} />
            )}
          </AnimatePresence>

          <NotificationToast notifications={notifications} onRemove={removeNotification} />
        </>
      )}
    </div>
  );
}
