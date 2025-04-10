import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);
        app.enableCors();

        const logger = new Logger();
        const configService = app.get(ConfigService);

        // Swagger configuration
        const options = new DocumentBuilder()
            .setTitle('MERN Stack')
            .setDescription('MERN Stack API documentation')
            .setVersion('1.0')
            .build();

        const document = SwaggerModule.createDocument(app, options);
        SwaggerModule.setup('api', app, document);

        const port = configService.get<number>('PORT') || 3000;
        await app.listen(port, () => {
            logger.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        Logger.error('Error during application bootstrap', error?.stack);
    }
}

bootstrap();
