import { ITemplateStrategy } from './ITemplateStrategy';
import { UserRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class OrganisationActivatedStrategy implements ITemplateStrategy {
  getTemplate(data: UserRegisterTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Dobrodošli u ${data.appName}!</h1>
      </div>
      <div class="email-body">
        <p>Pozdrav ${data.userEmail},</p>
        <p>Vaš korisnički račun je aktiviran od strane naših administratora te sada možete početi koristiti našu aplikaciju.</p>
        <p>Prijavi se u aplikaciju kroz niže naveden link:</p>
        <p>
          <a href="${data.link}" class="cta-button">Prijava</a>
        </p>
        <p>Lijepi pozdrav,<br>${data.appName}</p>
      </div>
      <div class="email-footer">
        <p>&copy; ${data.year} ${data.appName}. All rights reserved.</p>
      </div>
    </div>`;

    return baseEmailTemplate(body);
  }
}
