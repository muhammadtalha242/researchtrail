import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white" aria-label="Legal and project information">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>ResearchTrail · Academic discovery powered by OpenAlex</p>
        <nav aria-label="Legal information">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link className="underline underline-offset-4 hover:text-slate-950" href="/privacy">Privacy</Link></li>
            <li><Link className="underline underline-offset-4 hover:text-slate-950" href="/accessibility">Accessibility</Link></li>
            <li>
              <a
                className="underline underline-offset-4 hover:text-slate-950"
                href="https://www.uni-goettingen.de/de/439238.html"
                target="_blank"
                rel="noreferrer"
              >
                University legal notice<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
