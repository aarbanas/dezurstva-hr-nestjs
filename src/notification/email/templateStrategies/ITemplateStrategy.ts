import {
  NotifyCustomerForCertificateUploadTemplateData,
  OrganisationRegisterTemplateData,
  UserRegisterTemplateData,
} from './types';

export interface ITemplateStrategy {
  getTemplate(
    data:
      | UserRegisterTemplateData
      | OrganisationRegisterTemplateData
      | NotifyCustomerForCertificateUploadTemplateData,
  ): string;
}
