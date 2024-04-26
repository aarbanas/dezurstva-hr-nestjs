import { Injectable, NotFoundException } from '@nestjs/common';

import { S3Service } from '../../storage/s3.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CertificateAlreadyExistsError,
  MissingCertificateError,
} from '../certificate.errors';
import {
  CertificateResponseDto,
  CreateCertificateDto,
  SearchCertificatesQueryDto,
  UpdateCertificateDto,
} from '../dto';

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

  async getAllByUserId(
    query: SearchCertificatesQueryDto,
  ): Promise<CertificateResponseDto[]> {
    const { userId } = query;

    const certificates = await this.prismaService.certificate.findMany({
      where: {
        userAttribute: {
          User: {
            id: userId,
          },
        },
      },
    });

    return certificates.map((certificate) => ({
      id: certificate.id,
      key: certificate.key,
      type: certificate.type,
      validTill: certificate.validTill,
    }));
  }

  async create(userId: number, createCertificateDto: CreateCertificateDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user?.userAttributesId) throw new NotFoundException();

    const existingCertificate = await this.prismaService.certificate.findFirst({
      where: {
        type: createCertificateDto.type,
        userAttributeId: user?.userAttributesId,
      },
    });

    if (existingCertificate) {
      throw new CertificateAlreadyExistsError();
    }

    return this.prismaService.certificate.create({
      data: {
        key: createCertificateDto.key,
        type: createCertificateDto.type,
        validTill: createCertificateDto.validTill,
        userAttributeId: user.userAttributesId,
      },
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
    if (certificate.key) await this.s3Service.deleteOne(certificate.key);

    return this.prismaService.certificate.delete({ where: { id } });
  }

  upload(file: Express.Multer.File, userId: string) {
    const key = `documents/${userId}/${file.originalname}`;

    return this.s3Service.upload(file.buffer, key, { mimetype: file.mimetype });
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

    return this.s3Service.deleteOne(key);
  }
}
