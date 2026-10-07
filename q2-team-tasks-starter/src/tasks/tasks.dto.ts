import { PartialType } from "@nestjs/mapped-types";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { TaskStatus } from "./task.entity";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsInt()
  ownerId?: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
