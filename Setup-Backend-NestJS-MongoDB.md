## [**NestJS, MongoDB, Redis, NextJs and Docker**](https://medium.com/@imahmudul/powering-your-app-unleashing-the-potential-of-nestjs-mongodb-redis-nextjs-and-docker-106afe2aab3)

---

### Setting up NextJS Backend

_Note:_

*   _npm list -g --depth=0      (dùng để check xem nest được cài chưa)_
*   _npm uninstall -g nest       (gỡ cài đặt nest nếu có lỗi)_

_**Create new NestJS**_

```plaintext
npm install -g @nestjs/cli
nest new backend
cd backend
```

**Install dependencies for MongoDB and Redis**

```plaintext
yarn add @nestjs/mongoose mongoose @nestjs/cache-manager cache-manager cache-manager-redis-store@2.0.0 @nestjs/config
```

**Create new file:** _.env.development.local_

```plaintext
PORT=3000
MONGO_URL=mongodb://localhost:27017/mern-beyond
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=10
```

**Open** `src/app.module.ts` **file and configure the MongoDB connection:**

```plaintext
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DemoModule } from './demo/demo.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
      }),
    }),
    DemoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
```

**Create a Redis cache manager by generating a** `cache` **module and service:**

```plaintext
nest generate module cache
nest generate service cache
```

**Update the** `src/cache/cache.service.ts` **file as follows:**

```plaintext
// cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

  async get(key: string): Promise<any> {
    try {
      return JSON.parse(await this.cacheManager.get(key));
    } catch (e) {
      console.log({ e });
    }

  }

  async set(key: string, value: any, options?: object): Promise<void> {
    try {
      return await this.cacheManager.set(key, value, options);
    } catch (e) {
      console.log(e);
    }
  }

  // Add more cache-related operations as needed
}
```

**Update the** `src/cache/cache.module.ts` **file as follows:**

```plaintext
import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: configService.get('CACHE_TTL'),
      }),
    }),
    ConfigModule,
  ],
  providers: [
    CacheService,
  ],
  exports: [CacheModule, CacheService],
})
export class CacheConfigModule {}
```

**Now Add** `cacheConfigModule` **module to** `src/app.module.ts` **file:**

```plaintext
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local'],
    }),
    CacheConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
```

Lets install and integrate **swagger** to make our api testing easier:

```plaintext
yarn add swagger-ui-express @nestjs/swagger class-validator
```

**Update** `main.ts` **as follows:**

```plaintext
// update main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const logger = new Logger();
  const configService = app.get(ConfigService);

  // Swagger configuration
  const options = new DocumentBuilder()
    .setTitle('MERN Stack & Beyond')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`);
  });
}

bootstrap();
```

---

## Create `demo` predefine CRUD module:

**mern-stack/backend/src**

```plaintext
nest generate resource demo
```

**update - demo.controller.ts**

```plaintext
// update - demo.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { DemoService } from './demo.service';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post()
  create(@Body() createDemoDto: CreateDemoDto) {
    return this.demoService.create(createDemoDto);
  }

  @Get()
  findAll() {
    return this.demoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDemoDto: UpdateDemoDto) {
    return this.demoService.update(+id, updateDemoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demoService.remove(+id);
  }
}
```

**update - demo.service.ts**

```plaintext
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Demo } from './schemas/demo.schema';
import { Cache } from 'cache-manager';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class DemoService {
  constructor(
    @InjectModel(Demo.name) private demoModel: Model<Demo>,
    private cacheService: CacheService
  ) {

  }
  async create(createDemoDto: CreateDemoDto): Promise<Demo> {
    const createdDemo = new this.demoModel(createDemoDto);
    return createdDemo.save();
  }

  async findAll(): Promise<object> {
    try {
      const cachedData = await this.cacheService.get('demo_data');
      console.log({cachedData});
      if (cachedData) {
        // Data found in cache, set fromCache to true
        return {  cachedData, fromCache: true };
      }

      const data = await this.demoModel.find({}, { _id: 1, name: 1, age: 1, gender: 1, email: 1 }).exec();
      // Cache the data for future use

      await this.cacheService.set('demo_data', JSON.stringify(data));
      // Set fromCache to false for newly fetched data
      return { data, fromCache: false };
    } catch (e) {
      console.log(e);
    }

  }

  findOne(id: number) {
    return `This action return a #${id} demo`;
  }

  update(id: number, updateDemoDto: UpdateDemoDto) {
    return `This action updates a #${id} demo`;
  }

  remove(id: number) {
    return `This action removes a #${id} demo`;
  }
}
```

**update - demo.module.ts**

```plaintext
import { Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';
import { Demo, DemoSchema } from './schemas/demo.schema';
import { CacheConfigModule } from 'src/cache/cache.module';

@Module({
  imports: [
    CacheConfigModule,
    MongooseModule.forFeature([{ name: Demo.name, schema: DemoSchema }]),
  ],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
```

**update - dto/create-demo.dto.ts**

```plaintext
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateDemoDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the person',
    required: true,
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 25,
    description: 'The age of the person',
    required: true,
  })
  @IsInt()
  readonly age: number;

  @ApiProperty({
    example: 'Male',
    description: 'The gender of the person',
    required: true,
  })
  @IsString()
  readonly gender: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the person',
    required: true,
  })
  @IsString()
  readonly email: string;
}
```

**create** `schemas/demo.schema.ts`

```plaintext
// create schemas/demo.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DemoDocument = HydratedDocument<Demo>;

@Schema()
export class Demo {
  @Prop({ required: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop({ required: true })
  email: string;
}

export const DemoSchema = SchemaFactory.createForClass(Demo);
```

**Navigating to** `http://localhost:3000/api` **once your NestJS backend is running by this command:**

```plaintext
cd backend
yarn start:dev
```

---

## MongoDB

**Open Linux terminal:**

| **Bước** | **Lệnh Cần Thực Hiện** |
| --- | --- |

<table><tbody><tr><td><strong>Gỡ MongoDB cũ</strong></td><td><code>sudo apt-get remove --purge mongodb mongodb-server mongodb-server-core mongodb-clients mongodb-org*</code></td></tr></tbody></table>

<table><tbody><tr><td><strong>Xóa dữ liệu cũ</strong></td><td><code>sudo rm -rf /var/lib/mongodb</code><br><code>sudo rm -rf /var/log/mongodb</code><br><code>sudo rm -rf /etc/mongod.conf</code></td></tr></tbody></table>

<table><tbody><tr><td><strong>Xóa file lỗi</strong></td><td><code>sudo apt clean</code><br><code>sudo rm -rf /var/cache/apt/archives/mongodb-org-server_6.0.20_amd64.deb</code><br><code>sudo rm -rf /var/cache/apt/archives/mongodb-org-mongos_6.0.20_amd64.deb</code></td></tr></tbody></table>

<table><tbody><tr><td><strong>Cập nhật danh sách gói</strong></td><td><code>sudo apt update &amp;&amp; sudo apt autoremove</code></td></tr></tbody></table>

<table><tbody><tr><td><strong>Cài lại MongoDB 6.0</strong></td><td><code>wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -</code><br><code>echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list</code><br><code>sudo apt update</code><br><code>sudo apt install -y mongodb-org</code></td></tr></tbody></table>

<table><tbody><tr><td><strong>Khởi động MongoDB</strong></td><td><code>sudo systemctl start mongod &amp;&amp; sudo systemctl enable mongod</code></td></tr></tbody></table>

<table><tbody><tr><td><strong>Kiểm tra MongoDB</strong></td><td><code>mongod --version</code></td></tr></tbody></table>