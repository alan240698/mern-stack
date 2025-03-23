import { Test, TestingModule } from '@nestjs/testing';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { getModelToken } from '@nestjs/mongoose';
import { CacheService } from '../cache/cache.service'; // adjust if path is different
import { Demo } from './schemas/demo.schema';

describe('DemoController', () => {
  let controller: DemoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemoController],
      providers: [
        DemoService,
        {
          provide: getModelToken(Demo.name),
          useValue: {
            // Mock any methods used on demoModel
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<DemoController>(DemoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
