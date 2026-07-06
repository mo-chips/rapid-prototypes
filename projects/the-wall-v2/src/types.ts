export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  color?: string;
  linkedTaskIds?: string[];
}

export interface Task {

  id: string;

  text: string;

  completed: boolean;

  createdAt: number;

  priority: 'low' | 'medium' | 'high';

  dueDate: string;

  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';

  subtasks?: Subtask[];
  linkedNoteIds?: string[];

}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}
