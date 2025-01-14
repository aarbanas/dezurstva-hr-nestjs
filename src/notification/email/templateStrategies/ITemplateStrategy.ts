import {
  OrganisationRegisterTemplateData,
  UserRegisterTemplateData,
} from './types';

export interface ITemplateStrategy {
  getTemplate(
    data: UserRegisterTemplateData | OrganisationRegisterTemplateData,
  ): string;
}
