import { ITemplateStrategy } from './ITemplateStrategy';
import { NotifyCustomerForCertificateUploadTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';
import { CertificateType } from '@prisma/client';

export class AdminNotifyCustomerForCertificateUpload
  implements ITemplateStrategy
{
  getTemplate(data: NotifyCustomerForCertificateUploadTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Podsjetnik: Potrebno je učitati certifikat za dovršetak registracije</h1>
      </div>
      <div class="email-body">
        <p>Poštovani ${data.userFirstName} ${data.userLastName}, </p>
        <p>zahvaljujemo Vam na registraciji na našoj platformi. Kako bismo mogli dovršiti proces
          Vaše prijave i omogućiti Vam pristup svim funkcionalnostima, molimo Vas da učitate
          važeći dokument: ${this.translateCertificateType(data.certificateType)}.</p>

        <p>Učitavanje licence je nužno kako bismo mogli provjeriti vjerodostojnost Vaših ovlasti u
          suradnji s Hrvatskom liječničkom komorom te Hrvatskim Crvenim Križom. Vaši podaci su pritom u potpunosti 
          zaštićeni i povjerljivi.
        </p> 
        
        <p>Molimo Vas da što prije dovršite ovaj korak kako biste mogli koristiti našu platformu bez
          ograničenja. Kliknite na sljedeći link kako biste učitali svoj dokument:</p>
        </p>
        
        <p>
          <a href="${data.link}" class="cta-button">Dodaj certifikat</a>
        </p>
        
        <p>Za bilo kakva dodatna pitanja slobodno nas kontaktirajte na ${data.appEmail}.</p>
        
        <p>
          Srdačan pozdrav, <br />
          Tim ${data.appName} <br />
          ${data.appUrl}
        </p>  
      </div>
      <div class="email-footer">
        <p>&copy; ${data.year} ${data.appName}. All rights reserved.</p>
      </div>
    </div>`;

    return baseEmailTemplate(body);
  }

  private translateCertificateType(certificateType: CertificateType): string {
    switch (certificateType) {
      case 'ID':
        return 'Osobna iskaznica';
      case 'REDCROSS':
        return 'Licenca Crvenog križa';
      case 'UNIVERSITY':
        return 'Odobrenje za samostalan rad (licenca)';
      default:
        throw new Error('Nepoznat tip certifikata');
    }
  }
}
