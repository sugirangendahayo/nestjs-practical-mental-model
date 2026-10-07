import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role, User } from "../users/user.entity";
import { Task, TaskStatus } from "./task.entity";
import { CreateTaskDto, UpdateTaskDto } from "./tasks.dto";

const SEED_TASKS: Task[] = [
  {
    id: 1,
    title: "Set up CI pipeline",
    description: "",
    status: TaskStatus.Done,
    ownerId: 2,
  },
  {
    id: 2,
    title: "Write API docs",
    description: "OpenAPI + examples",
    status: TaskStatus.InProgress,
    ownerId: 2,
  },
  {
    id: 3,
    title: "Design onboarding flow",
    description: "",
    status: TaskStatus.Todo,
    ownerId: 3,
  },
  {
    id: 4,
    title: "Fix login bug",
    description: "Safari only",
    status: TaskStatus.Todo,
    ownerId: 3,
  },
];

@Injectable()
export class TasksService {
  private tasks: Task[] = SEED_TASKS.map((t) => ({ ...t }));
  private nextId = this.tasks.length + 1;

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(dto: CreateTaskDto, user: User): Task {
    const task: Task = {
      id: this.nextId++,
      title: dto.title,
      description: dto.description ?? "",
      status: dto.status ?? TaskStatus.Todo,
      ownerId: user.id,
    };
    this.tasks.push(task);
    return task;
  }

  update(id: number, dto: UpdateTaskDto, user: User): Task {
    const task = this.findOne(id);

    if (user.role === Role.Member && task.ownerId !== user.id) {
      throw new ForbiddenException("You can only modify your own tasks");
    }

    const { ownerId: ignoredOwnerId, ...safeDto } = dto;

    const nextTask = { ...task, ...safeDto };
    nextTask.ownerId = task.ownerId;

    this.tasks = this.tasks.map((item) => (item.id === id ? nextTask : item));
    return nextTask;
  }

  remove(id: number): void {
    this.findOne(id);
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }
}
