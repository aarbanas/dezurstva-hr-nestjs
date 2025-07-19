import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SessionUser } from '../../auth/passport-strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../../storage/s3.service';
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
import { EmailService } from '../../notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import { CertificateType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DiscordAdminInfoEvent } from '../../events/discord.events';

@Injectable()
export class CertificatesService {
  readonly #appName: string;
  readonly #appUrl: string;
  readonly #infoEmailAddress: string;
  constructor(
    private prismaService: PrismaService,
    private s3Service: S3Service,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.#appName = this.configService.getOrThrow('APP_NAME');
    this.#appUrl = this.configService.getOrThrow('APP_URL');
    this.#infoEmailAddress = this.configService.getOrThrow('EMAIL_ADDRESS');
  }

  get(id: number) {
    return this.prismaService.certificate.findFirst({
      where: { id },
    });
  }

  async search(
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

    return certificates;
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

    const result = await this.prismaService.certificate.create({
      data: {
        key: createCertificateDto.key,
        type: createCertificateDto.type,
        validTill: createCertificateDto.validTill,
        userAttributeId: user.userAttributesId,
      },
    });

    this.eventEmitter.emit(
      'discord.admin.info',
      new DiscordAdminInfoEvent(
        `📜User ${user.email} with ID ${userId} uploaded new certificate.`,
        [
          {
            title: 'Validate certificate',
            url: `${this.#appUrl}/admin/users/profile/${userId}`,
            color: 0x0099ff,
          },
        ],
      ),
    );

    return result;
  }

  async update(id: number, updateCertificateDto: UpdateCertificateDto) {
    return this.prismaService.certificate.update({
      where: { id },
      data: updateCertificateDto,
    });
  }

  async remove(user: SessionUser, id: number): Promise<void> {
    const certificate = await this.prismaService.certificate.findFirst({
      where: { id },
      include: {
        userAttribute: {
          select: {
            User: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) throw new MissingCertificateError();

    if (
      user.id !== certificate?.userAttribute?.User?.id &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException();
    }

    if (certificate.key) await this.s3Service.deleteOne(certificate.key);

    await this.prismaService.certificate.delete({ where: { id } });
  }

  async notifyToUpload(
    id: number,
    certificateType: CertificateType,
  ): Promise<void> {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      include: { userAttributes: true },
    });
    if (!user) throw new NotFoundException();

    await this.emailService.sendAdminNotifyCustomerForCertificateUploadEmail(
      user.email,
      {
        userFirstName: user.userAttributes?.firstname,
        userLastName: user.userAttributes?.lastname,
        appEmail: this.#infoEmailAddress,
        appName: this.#appName,
        appUrl: this.#appUrl,
        certificateType,
        link: `${this.#appUrl}/profile/certificates`,
        year: new Date().getFullYear(),
      },
    );
  }
}
