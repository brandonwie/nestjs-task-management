import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUserA = { id: 14, username: 'userA' };
const mockUserB = { id: 15, username: 'userB' };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      // call tasksService.getTasks
      const result = await tasksService.getTasks(filters, mockUserA);
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = {
        id: 1,
        title: 'Test task',
        description: 'Test desc',
        userId: 14,
      };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUserA);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUserA.id,
        },
      });
    });

    it('throw an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUserA)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.create() and returns the result', async () => {
      taskRepository.createTask.mockResolvedValue('someTask');
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const createTaskDto = { title: 'test task', description: 'test desc' };
      const result = await tasksService.createTask(createTaskDto, mockUserB);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUserB,
      );
      expect(result).toEqual('someTask');
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.deleteTask to delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(1, mockUserA);
      expect(taskRepository.delete).toBeCalledWith({
        id: 1,
        userId: mockUserA.id,
      });
    });

    it('throws an error as task could not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1, mockUserA)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('update tasks status', async () => {
      const save = jest.fn();
      tasksService.getTaskById = jest.fn();
      tasksService.getTaskById.mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUserA,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
