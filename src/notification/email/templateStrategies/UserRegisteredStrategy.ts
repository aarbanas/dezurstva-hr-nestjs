import { ITemplateStrategy } from './ITemplateStrategy';
import { UserRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class UserRegisteredStrategy implements ITemplateStrategy {
  getTemplate(data: UserRegisterTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Dobrodošli u ${data.appName}!</h1>
      </div>
      <div class="email-body">
        <p>Pozdrav ${data.userEmail},</p>
        <p>Radujemo se tvojoj registraciji u ${data.appName}. Molimo te samo da priložiš svoje ispravne certifikate kako
          bismo mogli provjeriti ispravnost podataka te započeti prikazivati tvoj profil organizacijama kojima su potrebne
          tvoje usluge.</p>
        <p>Prijavi se u aplikaciju te nakon toga klikni na poveznicu ispod to dodaj valjani dokument:</p>
        <p>
          <a href="${data.link}" class="cta-button">Dodaj certifikat</a>
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
