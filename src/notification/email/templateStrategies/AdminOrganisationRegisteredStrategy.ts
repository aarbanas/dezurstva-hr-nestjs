import { ITemplateStrategy } from './ITemplateStrategy';
import { UserRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class AdminOrganisationRegisteredStrategy implements ITemplateStrategy {
  getTemplate(data: UserRegisterTemplateData): string {
    const body = `<div class="email-container">
  <div class="email-header">
    <h1>Nova registracija organizacije</h1>
  </div>
  <div class="email-body">
    <p>Nova organizacija ${data.userEmail} se je registrirala na našu aplikaciju. Trebali bi popratiti uplate narednih dana
      kako bi im aktivirali korisnički račun!</p>
    <p>Za aktivaciju klikni na link:</p>
    <p>
      <a href="${data.link}" class="cta-button">Aktiviraj organizaciju</a>
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
