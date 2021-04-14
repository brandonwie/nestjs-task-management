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

    it('gets tasks only belong to the user', async () => {
      const mockTaskA = {
        id: 14,
        username: 'userA',
        title: 'task for A',
        description: 'testing for A',
        status: TaskStatus.OPEN,
      };
      // const mockTaskB = {
      //   title: 'task for B',
      //   description: 'desc of the task for B',
      //   status: TaskStatus.OPEN,
      // };

      taskRepository.getTasks.mockResolvedValue(mockTaskA);

      const filters: GetTasksFilterDto = {
        search: 'not have been tasted',
        status: TaskStatus.OPEN,
      };
      const result = await tasksService.getTasks(filters, mockUserB);
      expect(result).toEqual([]);
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
});
