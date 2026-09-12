import type { Metadata } from 'next';

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
          <li><strong>Search data:</strong> search terms, filters and OpenAlex identifiers are sent to the ResearchTrail API and then to OpenAlex to retrieve academic metadata. ResearchTrail does not intentionally persist search history.</li>
          <li><strong>Third-party links:</strong> source and PDF links contact the linked provider only after the user activates them. The provider then receives connection data such as the IP address and user agent.</li>
        </ul>
        <p>
          ResearchTrail has no user accounts, personal storage, application database, analytics or advertising, and it
          does not intentionally set cookies or use browser storage. It does not request special categories of personal
          data. Users should not enter personal or sensitive information into search queries.
        </p>
      </section>

      <section>
        <h2>3. Legal basis, recipients and transfers</h2>
        <p>
          The final operator must determine and document the applicable GDPR legal basis before deployment. Essential
          delivery and security logging may rely on legitimate interests (Art. 6(1)(f) GDPR); this assessment and any
          additional basis for providing the requested search service must be adapted if the university operates it.
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
          ResearchTrail does not intentionally retain search terms or OpenAlex responses. Hosting logs must be deleted
          according to the host&apos;s documented schedule. API inputs are validated, requests are rate-limited, the OpenAlex
          API key remains on the server and transport encryption (HTTPS) is required in production. No web application
          can guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>5. Your rights and controls</h2>
        <p>
          Depending on the applicable law, data subjects may have rights of access, rectification, erasure, restriction,
          data portability, objection and complaint to a supervisory authority. Because ResearchTrail does not maintain
          user profiles or personal application records, requests concerning infrastructure logs or other operator-held
          data require contacting the operator listed above. There is no automated self-service process for those logs.
        </p>
      </section>
    </main>
  );
}
