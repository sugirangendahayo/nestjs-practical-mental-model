# Question 3 — Wallet API

**Focus:** Interceptors (RxJS `map` / `tap`), exception filters (`@Catch`), custom `HttpException`s, metadata with `Reflector`
**Level:** Intermediate · **Suggested time:** 60–75 minutes

## Scenario

A fintech start-up exposes a small wallet API to its mobile app. The mobile team has three complaints:

1. **Responses are inconsistent.** Success bodies are raw objects or arrays, and errors come in several shapes.
2. **A crash leaked a database password** in an error response.
3. **Transfers are buggy.** Money can disappear, wallets can go negative, and balances show values like `249.70000000000002`.

Fix all three without adding boilerplate to every controller.

## Getting started

1. The dev server starts automatically (`npm run start:dev`) and reloads on save.
2. Open a **new terminal** and run `npm test` (or `npm run test:watch`).
3. Try requests by hand:
   ```bash
   npm run http -- GET /wallets
   npm run http -- POST /transfers '{"fromWalletId":"W-1001","toWalletId":"W-1002","amount":25.5}'
   npm run http -- GET /debug/crash
   ```

**Rules:** do not modify `test/`, the seed wallets, `debug.controller.ts` or `create-transfer.dto.ts`.

## Seed data

| id       | owner          | balance (USD) |
| -------- | -------------- | ------------- |
| `W-1001` | Aline Uwimana  | 250.00        |
| `W-1002` | Eric Nshuti    | 40.50         |
| `W-1003` | Grace Mukamana | 1000.00       |

## The response contract

**Every successful response:**

```json
{
  "success": true,
  "data": { "id": "W-1002", "owner": "Eric Nshuti", "currency": "USD", "balance": 40.5 },
  "timestamp": "2026-10-06T10:15:00.000Z"
}
```

**Every error response** (exactly these 4 top-level keys):

```json
{
  "success": false,
  "error": {
    "statusCode": 422,
    "code": "INSUFFICIENT_FUNDS",
    "message": "Wallet W-1002 has insufficient funds (balance 40.50, requested 100.00)"
  },
  "path": "/transfers",
  "timestamp": "2026-10-06T10:15:00.000Z"
}
```

| Situation | `statusCode` | `code` | `message` |
| --- | --- | --- | --- |
| One of **your** domain exceptions (Task 4) | its status | its own code, e.g. `INSUFFICIENT_FUNDS` | its message |
| Any other `HttpException` (validation, unknown route…) | its status | the name of the status, e.g. `BAD_REQUEST`, `NOT_FOUND` | its message. For validation errors, keep the **array** of messages |
| Anything else (a plain `Error`, a `TypeError`…) | `500` | `INTERNAL_SERVER_ERROR` | always `Internal server error` |

`timestamp` is an ISO-8601 string and `path` is the request URL.

## Tasks

### Task 1: Response envelope interceptor

- Create a global interceptor that wraps every successful response in `{ success, data, timestamp }`.
- Some routes must stay untouched: create a `@RawResponse()` decorator and use it on `GET /health`, which must keep returning exactly `{ "status": "ok" }`.

### Task 2: Global exception filter

- Create a filter that catches **everything** (including unknown routes and non-HTTP errors) and produces the error shape above.
- For unexpected errors, **log** the real error on the server (Nest's `Logger`) but **never** send its details to the client. `GET /debug/crash` must not reveal the password.

### Task 3: `X-Response-Time` header

- Create an interceptor that adds the header `X-Response-Time: <milliseconds>ms` (e.g. `X-Response-Time: 3ms`) to every successful response.

### Task 4: Custom domain exceptions

Create a small exception hierarchy: a base class that extends `HttpException` and carries a `code`, plus:

| Exception | HTTP | `code` | message |
| --- | --- | --- | --- |
| `WalletNotFoundException` | 404 | `WALLET_NOT_FOUND` | `Wallet <id> not found` |
| `SameWalletTransferException` | 400 | `SAME_WALLET_TRANSFER` | free text |
| `InsufficientFundsException` | 422 | `INSUFFICIENT_FUNDS` | must contain `insufficient funds` |

Your filter must handle any future domain exception **without being modified** (no `if` per exception class). Use `WalletNotFoundException` in `WalletsService`.

### Task 5: Fix `POST /transfers`

Body: `{ "fromWalletId": "W-1001", "toWalletId": "W-1002", "amount": 50 }` (validation is already done by the DTO).

The current implementation in `transfers.service.ts` has four bugs. Fix them so that:

- transferring to the **same wallet** gives 400 `SAME_WALLET_TRANSFER`;
- a wallet can never go below 0 (**422** `INSUFFICIENT_FUNDS`). Spending the exact balance is allowed;
- if **anything** fails (unknown receiver, insufficient funds…), **no balance changes** and no transfer is recorded;
- balances stay exact to the cent: three transfers of `0.10` from W-1001 leave exactly `249.7`, not `249.70000000000002`.

Success: **201**. `data` is `{ id, fromWalletId, toWalletId, amount, createdAt }`, with ids `T-0001`, `T-0002`, and so on. `GET /transfers` lists the recorded transfers.

## Hints

- You can register global enhancers in `configureApp()` (`app.useGlobalInterceptors` / `app.useGlobalFilters`) or in a module with `APP_INTERCEPTOR` / `APP_FILTER`. Both approaches pass the tests.
- `HttpStatus` is a TypeScript numeric enum, and those have a reverse mapping.
- `exception.getResponse()` can return a string **or** an object.
- Floating-point money is a classic bug. Think in cents.

## How you will be evaluated

1. Automated tests (`npm test`) pass.
2. Code quality: generic, reusable interceptors and filters, no try/catch boilerplate in controllers, no leaked internals.
