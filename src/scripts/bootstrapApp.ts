import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './application.module';

let app: INestApplicationContext;

export const bootstrapApp = async (): Promise<INestApplicationContext> => {
  if (app) {
    return app;
  }

  app = await NestFactory.createApplicationContext(ApplicationModule);

  return app;
};
