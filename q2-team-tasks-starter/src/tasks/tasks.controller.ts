import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { Roles } from "../auth/roles.decorator";
import { Role, User } from "../users/user.entity";
import { CreateTaskDto, UpdateTaskDto } from "./tasks.dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Roles(Role.Admin, Role.Member)
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(dto, user);
  }

  @Patch(":id")
  @Roles(Role.Admin, Role.Member)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number) {
    this.tasksService.remove(id);
  }
}
