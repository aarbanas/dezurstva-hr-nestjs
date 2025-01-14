import { ITemplateStrategy } from './ITemplateStrategy';
import { UserRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class ForgotPasswordStrategy implements ITemplateStrategy {
  getTemplate(data: UserRegisterTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Zaboravljena lozinka!</h1>
      </div>
      <div class="email-body">
        <p>Pozdrav ${data.userEmail},</p>
        <p>Poslali ste zahtjev za stvaranjem nove lozinke. Ukoliko niste poslali zahtjev za postavljanjem nove lozinke
        molimo Vas da ovaj email zanemarite.</p>
        <p>Postavljanje nove lozinke možete učiniti na našim stranicama tako da kliknete na idući link:</p>
        <p>
          <a href="${data.link}" class="cta-button">Postavi novu lozinku</a>
        </p>
        <p>Ako imaš bilo kakvih pitanja stojimo na raspologanju</p>
        <p>Lijepi pozdrav,<br>${data.appName}</p>
      </div>
      <div class="email-footer">
        <p>&copy; ${data.year} ${data.appName}. All rights reserved.</p>
      </div>
    </div>`;

    return baseEmailTemplate(body);
  }
}
