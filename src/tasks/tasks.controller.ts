import {
  Get,
  Controller,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Query } from '@nestjs/common';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';

/**
 * @route /task
 */
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  /** Get all tasks
   * @route /tasks
   * @pipe ValidationPipe
   * @param filterDto
   * @returns Task
   */
  @Get()
  getTasks(
    @Query(
      // just pass "ValidationPipe" to use v.7(simplified)
      new ValidationPipe({
        exceptionFactory: (errors) => new BadRequestException(errors),
      }),
    )
    filterDto: GetTasksFilterDto,
  ): Task[] {
    if (Object.keys(filterDto).length) {
      return this.tasksService.getTasksWithFilters(filterDto);
    } else {
      return this.tasksService.getAllTasks();
    }
  }

  /** Get a task by ID
   * @route /tasks/:id
   * @param id
   * @returns Task matches ID
   */
  @Get('/:id')
  async getTaskById(@Param('id') id: string): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  /** Create a task
   * @route /tasks
   * @pipe ValidationPipe
   * @param createTaskDto
   * @returns Task created
   */
  @Post()
  @UsePipes(
    // just pass "ValidationPipe" to use v.7(simplified)
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  )
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.createTask(createTaskDto);
  }

  /** Delete a task by ID
   * @route tasks/:id
   * @param id
   */
  @Delete('/:id')
  deleteTaskById(@Param('id') id: string): void {
    this.tasksService.deleteTaskById(id);
  }

  /** Update a task by ID
   * @route tasks/:id/status
   * @param id
   * @param status
   * @returns Task updated
   */
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Task {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
