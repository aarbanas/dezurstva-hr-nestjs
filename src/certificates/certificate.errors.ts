import { BadRequestException, NotFoundException } from '@nestjs/common';

export class MissingCertificateError extends NotFoundException {
  constructor() {
    super('Missing certificate');
  }
}

export class CertificateAlreadyExistsError extends BadRequestException {
  constructor() {
    super('Certificate already exists', {
      description: 'certificate_already_exists',
    });
  }
}
