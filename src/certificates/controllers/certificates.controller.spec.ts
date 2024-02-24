import { Test, TestingModule } from '@nestjs/testing';

import { CertificatesService } from '../services';
import { CertificatesController } from './certificates.controller';

describe('CertificatesController', () => {
  let controller: CertificatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [CertificatesService],
    }).compile();

    controller = module.get<CertificatesController>(CertificatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
