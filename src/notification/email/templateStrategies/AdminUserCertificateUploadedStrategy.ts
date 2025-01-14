import { ITemplateStrategy } from './ITemplateStrategy';
import { UserRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class AdminUserCertificateUploadedStrategy implements ITemplateStrategy {
  getTemplate(data: UserRegisterTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Novi certifikat je dodan</h1>
      </div>
      <div class="email-body">
        <p>Korisnik ${data.userEmail} dodao je novi certifikat. Bilo bi dobro da ga pregledamo i aktiviramo mu korisnički račun
          kako bi bio prikazan na našim stranicama.</p>
        <p>Za pregled certifikate klikni na link:</p>
        <p>
          <a href="${data.link}" class="cta-button">Pregledaj certifikat</a>
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
