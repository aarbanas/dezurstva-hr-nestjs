import { Injectable } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../service/s3.service';
import { MissingCertificateError } from './certificate.errors';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    private prismaService: PrismaService,
    private s3Service: S3Service,
  ) {}

  get(id: number) {
    return this.prismaService.certificate.findFirst({
      where: { id },
    });
  }

  create(createCertificateDto: CreateCertificateDto) {
    return this.prismaService.certificate.create({
      data: createCertificateDto,
    });
  }

  update(id: number, updateCertificateDto: UpdateCertificateDto) {
    return this.prismaService.certificate.update({
      where: { id },
      data: updateCertificateDto,
    });
  }

  async remove(id: number) {
    const certificate = await this.prismaService.certificate.findFirst({
      where: { id },
    });
    if (!certificate) throw new MissingCertificateError();
    if (certificate.key) await this.s3Service.delete(certificate.key);

    return this.prismaService.certificate.delete({ where: { id } });
  }

  upload(file: Express.Multer.File, userId: string) {
    return this.s3Service.upload(file, userId);
  }

  async getFile(id: number) {
    const { key } =
      (await this.prismaService.certificate.findFirst({
        where: { id },
      })) || {};
    if (!key) throw new MissingCertificateError();
    return this.s3Service.get(key);
  }

  async deleteFile(id: number) {
    const { key } =
      (await this.prismaService.certificate.findFirst({
        where: { id },
      })) || {};
    if (!key) throw new MissingCertificateError();

    return this.s3Service.delete(key);
  }
}
