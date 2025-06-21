import { CertificateType } from '@prisma/client';

export type UserRegisterTemplateData = {
  appName: string;
  userEmail: string;
  link: string;
  year: number;
};

export type OrganisationRegisterTemplateData = {
  appName: string;
  userEmail: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  amount: string;
  year: number;
};

export type NotifyCustomerForCertificateUploadTemplateData = {
  appName: string;
  appEmail: string;
  appUrl: string;
  certificateType: CertificateType;
  year: number;
  link: string;
  userFirstName?: string;
  userLastName?: string;
};
