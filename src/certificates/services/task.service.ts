/**
 * This service is responsible for running the cron job every night at 1 am
 * and will set active=false to the certificates that are not valid anymore.
 */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    const today = new Date();
    await this.prismaService.certificate.updateMany({
      where: {
        active: true,
        validTill: {
          lte: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0,
            0,
            0,
            0,
          ),
        },
      },
      data: {
        active: false,
      },
    });
  }
}
