import { ITemplateStrategy } from './ITemplateStrategy';
import { UserRegisterTemplateData } from './types';
import { baseEmailTemplate } from './BaseEmailTemplate';

export class ApologyEmailForRegistrationWithIssues
  implements ITemplateStrategy
{
  getTemplate(data: UserRegisterTemplateData): string {
    const body = `<div class="email-container">
      <div class="email-header">
        <h1>Isprika zbog prekida rada sustava — sustav ponovno dostupan</h1>
      </div>
      <div class="email-body">
        <p>Poštovani ${data.userEmail},</p>
        
        <p>željeli bismo se ispričati zbog tehničkih poteškoća koje su nastale nakon što smo pustili reklamu u 
        opticaj. Zbog neočekivano velikog broja registracija u kratkom vremenu, naš sustav je bio preopterećen 
        i morali smo hitno migrirati stranicu na novi server.</p>
        
        <p>Dobra vijest je da sada sve ponovno radi ispravno i vaša registracija je uspješno evidentirana. Molimo 
        vas da se pokušate prijaviti na stranicu i dovršite proces tako da učitate važeće licence, 
        kako bismo ih mogli provjeriti i potvrditi njihovu pravovaljanost.</p>
        <p>Prijavi se u aplikaciju te nakon toga klikni na poveznicu ispod to dodaj valjani dokument:</p>
        <p>
           <a href="${data.link}" class="cta-button">Dodaj certifikat</a>
        </p>
        
        <p>Hvala na vašem strpljenju i razumijevanju. Ako budete imali bilo kakvih pitanja ili problema, slobodno 
        nam se obratite.</p>
        
        <p>Lijepi pozdrav,<br>${data.appName}</p>
      </div>
      <div class="email-footer">
        <p>&copy; ${data.year} ${data.appName}. All rights reserved.</p>
      </div>
    </div>`;

    return baseEmailTemplate(body);
  }
}
