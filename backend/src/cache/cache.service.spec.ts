import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CacheModule } from '@nestjs/cache-manager';  // Import CacheModule từ NestJS Cache

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    // Import CacheModule vào TestModule để cung cấp CACHE_MANAGER
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule],  // Import CacheModule để cung cấp CACHE_MANAGER
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);  // Get CacheService
  });

  it('should be defined', () => {
    expect(service).toBeDefined();  // Kiểm tra CacheService đã được khởi tạo đúng
  });
});
