# Question 4 — URL Shortener

**Focus:** Custom providers (`useClass` / `useValue` / `useFactory`), injection tokens and `@Inject`, custom pipes, middleware, redirects
**Level:** Intermediate · **Suggested time:** 75–90 minutes

## Scenario

The marketing team wants a URL shortener (like bit.ly) for campaign links. A prototype exists, but:

- it calls `Math.random()`, `new Date()` and a hard-coded `http://localhost:3000` **directly inside the service**, so its behaviour cannot be tested reliably;
- it ignores custom slugs, expiry and slug collisions;
- the redirect and stats endpoints don't exist yet.

Your job: make it **testable through dependency injection** and finish the features.

## Getting started

1. The dev server starts automatically (`npm run start:dev`) and reloads on save.
2. Open a **new terminal** and run `npm test` (or `npm run test:watch`).
3. Try requests by hand:
   ```bash
   npm run http -- POST /links '{"url":"https://docs.nestjs.com","customSlug":"nest-docs"}'
   npm run http -- GET /nest-docs
   npm run http -- GET /links/nest-docs/stats
   ```
   You can also open `/<slug>` in the preview pane to see the redirect.

**Rules:** do not modify `test/` or `src/links/links.constants.ts`. The tests **replace** the slug generator, clock and config with fakes through these tokens.

## Provided building blocks

`src/links/links.constants.ts` defines three injection tokens and their contracts:

| Token | Contract | Production implementation |
| --- | --- | --- |
| `SLUG_GENERATOR` | `{ generate(): string }` | `RandomSlugGenerator` (already written) |
| `CLOCK` | `{ now(): Date }` | `SystemClock` (already written) |
| `APP_CONFIG` | `{ baseUrl: string }` | build it from the `BASE_URL` environment variable, default `http://localhost:3000` |

## Endpoints to deliver

### `POST /links`: create a short link

| Field | Rules |
| --- | --- |
| `url` | required, must be an absolute `http` or `https` URL (`nestjs.com` and `ftp://…` are rejected) |
| `customSlug` | optional, 4–20 characters, only letters, digits and `-` |
| `expiresInMinutes` | optional **integer** JSON number between 1 and 525600 (one year) |

```http
POST /links
{ "url": "https://docs.nestjs.com/providers", "expiresInMinutes": 90 }

201 Created
{
  "slug": "abc123",
  "url": "https://docs.nestjs.com/providers",
  "shortUrl": "http://localhost:3000/abc123",
  "clicks": 0,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "expiresAt": "2026-01-01T11:30:00.000Z"
}
```

- `expiresAt` is `null` when `expiresInMinutes` is not given.
- `customSlug` already taken: **409**.
- Without `customSlug`, ask the slug generator. If the generated slug is already used, **ask again**, up to **5 attempts in total**. If all 5 collide: **503** with the message `Could not generate a unique slug, please retry`.

### `GET /:slug`: redirect

- **302** redirect (`Location` header) to the original URL.
- Each successful redirect increments `clicks` and sets `lastAccessedAt` to "now".
- Unknown slug: **404**.
- Expired link (now ≥ `expiresAt`): **410 Gone**. Blocked visits are **not** counted.
- Malformed slug (not 4–20 letters, digits or `-`): **400**, rejected **before** the service is called.

### `GET /links/:slug/stats`: statistics

```json
{
  "slug": "abc123",
  "url": "https://docs.nestjs.com/providers",
  "shortUrl": "http://localhost:3000/abc123",
  "clicks": 2,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "expiresAt": null,
  "lastAccessedAt": "2026-01-01T10:05:00.000Z",
  "expired": false
}
```

Stats stay available after a link expires (`"expired": true`). Malformed slug: **400**. Unknown slug: **404**.

## Tasks

### Task 1: Validation

Replace the placeholder rules in `CreateLinkDto` with the rules above.

### Task 2: Custom providers

- In `LinksModule`, register the three tokens: `useClass` for the generator and the clock, `useFactory` for `APP_CONFIG`.
- Inject them into `LinksService` with `@Inject(TOKEN)`. The service must **not** call `Math.random()`, `new Date()` or contain a hard-coded base URL any more.
- Implement `customSlug`, `expiresInMinutes`, the 409 conflict and the collision-retry logic.

### Task 3: Redirect and `SlugPipe`

- Write a reusable `SlugPipe` (a class that implements `PipeTransform`) that throws **400** for a malformed slug.
- Add a controller for `GET /:slug` that performs the redirect. Make sure `GET /` (the info route) still works.

### Task 4: Stats endpoint

Add `GET /links/:slug/stats` (reuse `SlugPipe`).

### Task 5: `RequestIdMiddleware`

- Every response must carry an `X-Request-Id` header.
- If the client sent an `X-Request-Id`, echo it back. Otherwise generate one with `crypto.randomUUID()`.
- Apply it to **all routes** from `AppModule` (implement `NestModule.configure`).

## Hints

- A provider can be `{ provide: TOKEN, useClass: … }`, `{ provide: TOKEN, useValue: … }` or `{ provide: TOKEN, useFactory: () => … }`.
- `@Redirect()` from `@nestjs/common` lets a handler return `{ url, statusCode }`.
- `GoneException`, `ConflictException` and `ServiceUnavailableException` are built in.

## How you will be evaluated

1. Automated tests (`npm test`) pass.
2. Code quality: dependency inversion through tokens, reusable pipe and middleware, clean separation between HTTP and business logic.
