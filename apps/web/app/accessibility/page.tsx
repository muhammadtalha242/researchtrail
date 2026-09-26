import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility statement | ResearchTrail',
  description: 'Accessibility status, known limitations and feedback route for ResearchTrail.',
};

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="legal-content">
      <h1>Accessibility statement</h1>
      <p className="mt-3 text-sm text-slate-600">Prepared on 12 September 2026</p>
      <p>
        ResearchTrail aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA and the
        relevant requirements of EN 301 549. This statement applies to the ResearchTrail web application.
      </p>

      <section>
        <h2>Conformance status</h2>
        <p>
          The application is partially conformant with WCAG 2.2 AA. The interface uses semantic landmarks and headings,
          associated form labels, visible keyboard focus, a skip link, text alternatives for icon-only controls, status
          announcements, sufficient control contrast and reduced-motion support. Core search, publication, graph and
          trend functions are designed for keyboard use and responsive zoom.
        </p>
      </section>

      <section>
        <h2>Known limitations</h2>
        <ul>
          <li>The Cytoscape citation canvas is primarily visual. A keyboard-accessible list of every publication in the graph is provided alongside it, but it does not reproduce the edge relationships in equivalent detail.</li>
          <li>The custom trend charts provide textual headings and values, but their hover interactions are more convenient with a pointer.</li>
          <li>Content loaded from OpenAlex and external publication websites is outside ResearchTrail&apos;s accessibility control.</li>
          <li>A complete audit with multiple screen readers and users with disabilities is still outstanding.</li>
        </ul>
      </section>

      <section>
        <h2>Assessment method</h2>
        <p>
          The current assessment combines source review, semantic HTML and TypeScript linting, keyboard-only checks,
          responsive layout inspection, automated source accessibility rules and manual contrast/focus review. The
          final deployment should additionally be tested at 200% and 400% zoom and with current versions of NVDA/Firefox
          and VoiceOver/Safari.
        </p>
      </section>

      <section>
        <h2>Feedback and contact</h2>
        <p>
          If you encounter a barrier, contact <strong>talha@example.com</strong>{' '}
          and describe the page, the problem, the assistive technology used and the format you need. The project operator
          should acknowledge the report and provide an accessible alternative where possible.
        </p>
      </section>

      <section>
        <h2>University legal information</h2>
        <p>
          See the{' '}
          <a href="https://www.uni-goettingen.de/de/439238.html" target="_blank" rel="noreferrer">
            University of Göttingen legal notice<span className="sr-only"> (opens in a new tab)</span>
          </a>.
        </p>
      </section>
    </main>
  );
}
