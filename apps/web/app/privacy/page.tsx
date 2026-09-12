import type { Metadata } from 'next';
import { PrivacyControls } from '@/components/privacy-controls';

export const metadata: Metadata = {
  title: 'Privacy information | ResearchTrail',
  description: 'How ResearchTrail processes and protects personal data.',
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="legal-content">
      <h1>Privacy information</h1>
      <p className="mt-3 text-sm text-slate-600">Version: 12 September 2026</p>
      <p>
        This notice describes the data processing implemented by ResearchTrail. Before a public deployment, the
        project operator must add their name, postal address, contact email, hosting provider and the applicable
        retention periods. This project-specific notice does not replace the University of Göttingen&apos;s own privacy
        notices for university services.
      </p>

      <section>
        <h2>1. Controller and contact</h2>
        <p><strong>Responsible project operator:</strong> [complete before public deployment]</p>
        <p><strong>Contact:</strong> [complete before public deployment]</p>
        <p>
          The University of Göttingen&apos;s official legal information is available in its{' '}
          <a href="https://www.uni-goettingen.de/de/439238.html" target="_blank" rel="noreferrer">
            legal notice<span className="sr-only"> (opens in a new tab)</span>
          </a>.
        </p>
      </section>

      <section>
        <h2>2. Data processed and purposes</h2>
        <ul>
          <li><strong>Server access data:</strong> IP address, request time, requested resource, status and user agent may be processed by the web/API host for secure delivery, troubleshooting and abuse prevention.</li>
          <li><strong>Account data:</strong> email address, optional display name, a one-way password hash, account timestamps and authentication metadata are used to create and protect an account.</li>
          <li><strong>Library data:</strong> saved publication metadata, reading status, personal notes, collections and timestamps provide the personal-library features.</li>
          <li><strong>Search data:</strong> search terms, filters and OpenAlex identifiers are sent to the ResearchTrail API and then to OpenAlex to retrieve academic metadata. ResearchTrail does not intentionally persist search history in its database.</li>
          <li><strong>Browser storage:</strong> the access token and basic account profile are stored in local storage so the user remains signed in. No advertising or analytics cookies are set by the application.</li>
        </ul>
        <p>ResearchTrail does not request special categories of personal data. Users should not put sensitive personal information into notes or search queries.</p>
      </section>

      <section>
        <h2>3. Legal basis, recipients and transfers</h2>
        <p>
          The final operator must determine and document the applicable GDPR legal basis before deployment. For a
          voluntary student demonstration, account processing will commonly rely on performance of the service
          requested by the user (Art. 6(1)(b) GDPR), while essential security logging may rely on legitimate interests
          (Art. 6(1)(f) GDPR). This assessment must be adapted if the university operates the service.
        </p>
        <p>
          Academic queries and identifiers are sent to the OpenAlex API. Source and PDF links lead to third-party
          websites only after the user activates them; those providers process data under their own notices. The final
          deployment documentation must identify the hosting provider, processing location and any processors or
          international transfers.
        </p>
      </section>

      <section>
        <h2>4. Retention and security</h2>
        <p>
          Account and library data remain until the account is deleted or the operator&apos;s documented retention period
          expires. Hosting logs must be deleted according to the host&apos;s configured schedule. Passwords are hashed with
          bcrypt, API inputs are validated, write access is user-scoped, requests are rate-limited and transport
          encryption (HTTPS) is required in production. No web application can guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>5. Your rights and controls</h2>
        <p>
          Depending on the applicable law, data subjects may have rights of access, rectification, erasure, restriction,
          data portability, objection and complaint to a supervisory authority. Signed-in users can erase their account
          below. Notes, reading status and saved works can be corrected or removed in the library. Access, portability,
          account identity rectification and other requests require contacting the operator listed above.
        </p>
        <PrivacyControls />
      </section>
    </main>
  );
}
