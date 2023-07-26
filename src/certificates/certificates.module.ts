import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { S3Service } from '../service/s3.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, S3Service, ConfigService],
  imports: [PrismaModule],
})
export class CertificatesModule {}
