import { ITemplateStrategy } from './ITemplateStrategy';
import { OrganisationRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class OrganisationRegisteredStrategy implements ITemplateStrategy {
  getTemplate(data: OrganisationRegisterTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Dobrodošli u ${data.appName}!</h1>
      </div>
      <div class="email-body">
        <p>Pozdrav ${data.userEmail},</p>
        <p>Radujemo se vašoj registraciji u ${data.appName}. Molimo vas da izvrišite uplatu po niže navedenim podacima kako
          biste mogli započeti koristiti našu aplikaciju te pretraživati liječnike, medicinske tehničare i spasioce.
          Po aktivaciji zaprimiti ćete mail.</p>
        <p>Podaci za uplatu:</p>
        <ul>
          <li>Ime banke: ${data.bankName}</li>
          <li>Broj računa: ${data.accountNumber}</li>
          <li>IBAN: ${data.iban}</li>
          <li>SWIFT: ${data.swift}</li>
          <li>Iznos: ${data.amount}</li>
        </ul>
        <p>Ako imate bilo kakvih pitanja stojimo na raspologanju</p>
        <p>Lijepi pozdrav,<br>${data.appName}</p>
      </div>
      <div class="email-footer">
        <p>&copy; ${data.year} ${data.appName}. All rights reserved.</p>
      </div>
    </div>`;

    return baseEmailTemplate(body);
  }
}
