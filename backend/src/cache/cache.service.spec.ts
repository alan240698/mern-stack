import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          store: cacheManager,
            ttl: 10,  // Thời gian tồn tại của cache
            max: 100, // Số lượng tối đa của cache
          }),
      ],
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
