# ResearchTrail

ResearchTrail is a stateless full-stack academic discovery application built around the OpenAlex API. It provides four core research workflows:

1. **Research discovery** — keyword search, year filters, open-access filtering, sorting and pagination.
2. **Publication detail** — metadata, reconstructed abstracts, topics, source links and related works.
3. **Citation explorer** — a bounded one-hop graph of references and citing publications.
4. **Topic trends** — publication growth, citation activity, notable authors, related topics and highly cited works.

The application deliberately has no user-specific or persistent-data features, recommendations, PDF analysis, collaboration, background jobs or analytics. This keeps the semester-project scope focused and minimises personal-data processing.

The detailed course submission report and criterion-by-criterion audit are in [EXAM_REPORT.md](./EXAM_REPORT.md).

## Stack

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Cytoscape.js
- **Backend:** NestJS 11, TypeScript, class-validator, request throttling
- **External API:** OpenAlex

## Prerequisites

- Node.js 22 or newer and npm 10 or newer ([download Node.js](https://nodejs.org/))
- A free OpenAlex API key (create one in your OpenAlex account settings)

Verify the system dependencies:

```bash
node --version
npm --version
```

## Development setup

### 1. Install local dependencies

From the repository root:

```bash
npm install
```

This installs both npm workspaces (`apps/api` and `apps/web`) from the root lockfile.

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Set `OPENALEX_API_KEY` in `apps/api/.env`. The examples already contain suitable local values for `PORT`, `OPENALEX_BASE_URL`, `FRONTEND_URL` and `NEXT_PUBLIC_API_URL`.

### 3. Run in development mode

```bash
npm run dev
```

Open:

- Web application: http://localhost:3000
- API base URL: http://localhost:4000/api

The root command starts both workspaces in watch mode. To run them separately:

```bash
npm run dev --workspace @research-trail/api
npm run dev --workspace @research-trail/web
```

## Quality checks and production build

```bash
npm run lint
npm run build
```

After a successful build, run the production services in separate terminals:

```bash
npm run start --workspace @research-trail/api
npm run start --workspace @research-trail/web
```

The API needs `OPENALEX_API_KEY` at runtime. The frontend uses `NEXT_PUBLIC_API_URL` to locate it. Configure `FRONTEND_URL` to the exact public frontend origin and deploy both services behind HTTPS.

## API routes

All routes are public, read-only JSON endpoints below `/api`:

```text
GET /api/search?q=...
GET /api/works/:id
GET /api/works/:id/graph
GET /api/trends?q=... or ?topicId=...
GET /api/trends/topics?q=...
GET /api/trends/topic/:id
```

## Project structure

```text
research-trail/
├── apps/
│   ├── api/              # NestJS API and OpenAlex adapter
│   └── web/              # Next.js user interface
├── EXAM_REPORT.md        # Submission report and evaluation audit
├── package.json          # npm workspace scripts
└── README.md
```

Frontend styles are separated into `apps/web/styles/base.css` for document defaults, focus and motion preferences, and `apps/web/styles/components.css` for reusable UI and legal-content classes. Page-specific layout remains close to each React view through Tailwind utility classes.

## Scope and data-flow notes

- OpenAlex abstracts arrive as an inverted index; the backend reconstructs readable text.
- The graph is intentionally limited to eight references and eight citing works.
- Citation counts are metadata, not a scientific-quality score.
- The frontend never calls OpenAlex directly. The backend keeps the OpenAlex API key out of browser bundles and normalises external responses.
- ResearchTrail does not intentionally persist queries or results and has no application database.
- Privacy information, the accessibility statement and the University of Göttingen legal notice are linked from every page footer.
