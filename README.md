# ResearchTrail

ResearchTrail is a compact full-stack academic discovery application built around the OpenAlex API. It implements four primary views:

1. **Research Discovery** — keyword search, year filters, open-access filter, sorting and pagination.
2. **Publication Detail** — metadata, reconstructed abstract, topics, source links and related works.
3. **Citation Explorer** — a limited one-hop graph of references and citing publications.
4. **Personal Library** — JWT authentication, saved papers, notes, reading status and collections.

The implementation deliberately excludes recommendations, PDF analysis, collaboration, Redis and background jobs to keep the semester-project scope manageable.

The detailed course submission and criterion-by-criterion audit are in [EXAM_REPORT.md](./EXAM_REPORT.md).

## Stack

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Cytoscape.js
- **Backend:** NestJS 11, TypeScript, Passport JWT, class-validator
- **Database:** PostgreSQL 16, Prisma ORM 7 with the PostgreSQL driver adapter
- **External API:** OpenAlex

## Prerequisites

- Node.js 22+ and npm 10+ ([download Node.js](https://nodejs.org/))
- Docker Desktop with Docker Compose ([installation instructions](https://docs.docker.com/get-docker/)), or a local PostgreSQL 16 instance
- A free OpenAlex API key (create one in your OpenAlex account settings)

Verify the system dependencies:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env` and provide:

- a strong `JWT_SECRET`
- your `OPENALEX_API_KEY`

### 3. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 4. Generate Prisma Client and migrate the database

```bash
npm run db:generate
npm run db:migrate -- --name init
```

### 5. Start frontend and backend

```bash
npm run dev
```

Open:

- Web: http://localhost:3000
- API: http://localhost:4000/api

`npm run dev` starts both workspaces with watch mode. To run them separately, use:

```bash
npm run dev --workspace @research-trail/api
npm run dev --workspace @research-trail/web
```

## Quality checks and production build

```bash
npm run lint
npm run build
```

Run the production builds after a successful build:

```bash
npm run start --workspace @research-trail/api
npm run start --workspace @research-trail/web
```

The API requires `DATABASE_URL`, `JWT_SECRET` and (for normal OpenAlex quota) `OPENALEX_API_KEY` at runtime. The frontend uses `NEXT_PUBLIC_API_URL` to locate the API. Deploy both services behind HTTPS and configure `FRONTEND_URL` to the exact public frontend origin.

## API routes

### Public

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/search?q=...
GET  /api/works/:id
GET  /api/works/:id/graph
GET  /api/trends?q=...
GET  /api/trends/topics?q=...
GET  /api/trends/topic/:id
```

### Authenticated

```text
GET    /api/library
POST   /api/library
PATCH  /api/library/:id
DELETE /api/library/:id

GET    /api/collections
POST   /api/collections
DELETE /api/collections/:id
POST   /api/collections/:id/works
DELETE /api/collections/:id/works/:savedWorkId
DELETE /api/auth/account
```

## Project structure

```text
research-trail/
├── apps/
│   ├── api/              # NestJS, Prisma and OpenAlex adapter
│   └── web/              # Next.js user interface
├── docker-compose.yml    # PostgreSQL for local development
├── package.json          # npm workspaces
└── README.md
```

Frontend styles are deliberately separated into `apps/web/styles/base.css` (document defaults, focus and motion preferences) and `apps/web/styles/components.css` (reusable UI and legal-content classes). Page-specific layout remains close to each React view through Tailwind utility classes.

## Prisma generation

The generated Prisma Client is intentionally not committed. Run `npm run db:generate` after installing dependencies and whenever the Prisma schema changes.

## Scope notes

- OpenAlex abstracts arrive as an inverted index; the backend reconstructs readable text.
- The graph is intentionally limited to eight references and eight citing works.
- Citation counts are shown as metadata, not as a scientific-quality score.
- The frontend never calls OpenAlex directly. All access goes through the backend.
- Search queries are proxied but not intentionally stored in PostgreSQL.
- Privacy, accessibility and the University of Göttingen legal notice are linked from every page footer.
