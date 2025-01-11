import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = new DocumentBuilder()
    .setTitle('Babylon')
    .setDescription('The Babylon API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  app.enableCors({
    origin: process.env.ENV === 'production' ? process.env.APP_URL : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Set to true if you need to send cookies
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch(() => {
  process.exit(1);
});
