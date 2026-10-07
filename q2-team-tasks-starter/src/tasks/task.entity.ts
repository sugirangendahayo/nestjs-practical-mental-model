export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  ownerId: number;
}
