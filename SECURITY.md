# Security notes

## Security model

ResearchTrail is a public, read-only application. It has no user identity, privileged role, write endpoint or application database. Its principal assets are service availability, the server-side OpenAlex API key, trustworthy navigation targets and the integrity of the rendered application.

The browser talks only to the ResearchTrail API. The API validates requests and talks only to `https://api.openalex.org`. OpenAlex metadata is untrusted display data: React escapes text, OpenAlex identifiers are allow-listed before use in upstream paths or internal links, and external links are restricted to credential-free HTTPS URLs.

## Implemented controls

- Patched framework versions and a lockfile checked with `npm audit`.
- Strict DTO validation with unknown query fields rejected.
- Work IDs must match `W` plus digits; topic IDs must match `T` plus digits.
- A 12-second upstream timeout, declared-response size limit and generic upstream error responses.
- Helmet on the JSON API and a frontend Content Security Policy plus clickjacking, MIME, referrer, opener and Permissions Policy headers.
- `Cache-Control: no-store` on API responses.
- Exact-origin production CORS with only `GET`, `HEAD` and `OPTIONS` permitted cross-origin.
- Loopback-only API binding by default.
- Loopback-only frontend and API development servers by default.
- Per-client request limits: 10/second burst, 60/minute sustained and 10/minute for graph/full-trend fan-out routes.
- No cookies, browser persistence, analytics or intentional query/result storage.

## Deployment requirements

- Terminate TLS correctly and set `ENABLE_HSTS=true` only after the frontend is reliably HTTPS-only.
- Set `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` to their exact public values.
- Set `HOST=0.0.0.0` only when the deployment environment requires an externally reachable container/process.
- When a reverse proxy is present, set `TRUST_PROXY_HOPS` to its exact hop count. Never trust arbitrary forwarded addresses.
- The rate-limit store is in memory and applies per process. Multiple API instances require an aggregate edge limit or a shared rate-limit store.
- Keep the OpenAlex key in the deployment secret store and out of frontend variables, logs and source control.
- Run `npm audit`, `npm run test`, `npm run lint` and `npm run build` for every release.

## Residual risks

- A static Next.js build needs inline bootstrap scripts, so the CSP currently permits inline scripts. The application does not render raw HTML; a nonce-based CSP would be the next hardening step if all pages are changed to dynamic rendering.
- Availability depends on OpenAlex and the hosting provider. Application rate limiting cannot replace provider-level DDoS protection.
- OpenAlex controls scholarly metadata and destination URLs. URL scheme checks prevent script schemes, but users must still assess external sites before following them.
- Infrastructure may log IP addresses, request paths and user agents according to the operator’s deployment configuration and retention policy.
