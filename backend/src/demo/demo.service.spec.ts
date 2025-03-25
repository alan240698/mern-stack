import { Test, TestingModule } from '@nestjs/testing';
import { DemoService } from './demo.service';
import { getModelToken } from '@nestjs/mongoose';
import { Demo } from './schemas/demo.schema';
import { CacheService } from '../cache/cache.service'; // Adjust path if necessary

describe('DemoService', () => {
    let service: DemoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DemoService,
                {
                    provide: getModelToken(Demo.name),
                    useValue: {
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

        service = module.get<DemoService>(DemoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
