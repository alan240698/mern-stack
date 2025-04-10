import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';
import { Demo, DemoSchema } from './schemas/demo.schema';
import { CacheConfigModule } from '../cache/cache.module';

@Module({
    imports: [
        CacheConfigModule,
        MongooseModule.forFeature([{ name: Demo.name, schema: DemoSchema }]), // Register Schema
    ],
    controllers: [DemoController],
    providers: [DemoService],
})
export class DemoModule {}
