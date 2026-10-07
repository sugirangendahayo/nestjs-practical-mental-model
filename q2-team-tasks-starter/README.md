# Question 2 — Team Tasks API

**Focus:** Guards, `APP_GUARD`, metadata with `SetMetadata` + `Reflector`, custom decorators (`createParamDecorator`), 401 vs 403
**Level:** Intermediate · **Suggested time:** 60–75 minutes

## Scenario

A small team tracks its work with this API. The CRUD endpoints already work, but **anyone can do anything**: there is no authentication, viewers can delete tasks, anyone can create a task in someone else's name, and `GET /users` leaks every user's secret token.

Add authentication and role-based authorization **the NestJS way**: guards, metadata decorators and a custom parameter decorator. Do not just put `if` statements in each controller.

## Getting started

1. The dev server starts automatically (`npm run start:dev`) and reloads on save.
2. Open a **new terminal** and run `npm test` (or `npm run test:watch`).
3. Try requests by hand with the helper script:
   ```bash
   npm run http -- GET /tasks -H "Authorization: Bearer token-brian"
   npm run http -- POST /tasks '{"title":"Write tests"}' -H "Authorization: Bearer token-chloe"
   ```

**Rules:** do not modify `test/`, `src/users/users.seed.ts` or `src/projects/`. Everything else is yours to change.

## How authentication works here

Clients send the header `Authorization: Bearer <token>`. Tokens are fake (no JWT library needed). `UsersService.findByToken(token)` returns the matching user or `undefined`.

| id | name           | role     | token         | owns tasks |
| -- | -------------- | -------- | ------------- | ---------- |
| 1  | Amina Uwase    | `admin`  | `token-amina` | none       |
| 2  | Brian Mugisha  | `member` | `token-brian` | 1, 2       |
| 3  | Chloe Ineza    | `member` | `token-chloe` | 3, 4       |
| 4  | Diego Habimana | `viewer` | `token-diego` | none       |

## Access rules to implement

| Route                          | Who may call it                                      |
| ------------------------------ | ---------------------------------------------------- |
| `GET /`, `GET /health`         | everyone, **no token needed**                        |
| `GET /users/me`                | any authenticated user                               |
| `GET /users`                   | `admin`                                              |
| `GET /tasks`, `GET /tasks/:id` | any authenticated user                               |
| `POST /tasks`                  | `admin`, `member`                                    |
| `PATCH /tasks/:id`             | `admin` (any task), `member` (**only their own** tasks) |
| `DELETE /tasks/:id`            | `admin`                                              |
| any other route (e.g. `GET /projects`) | any authenticated user                       |

## Tasks

### Task 1: `AuthGuard` (401 Unauthorized)

- Reads the `Authorization` header. The scheme must be `Bearer`, followed by a token.
- Missing header, wrong scheme, empty token or unknown token: **401** with the message `Missing or invalid access token`.
- On success, attaches the user to the request (`request.user`) so later steps can use it.
- Must be registered **globally** so the app is *secure by default*: `ProjectsController` (which you must not touch) must require a token too.

### Task 2: `@Public()` decorator

- A metadata decorator that lets a route (or a whole controller) skip authentication.
- Use it so `GET /` and `GET /health` work without a token.

### Task 3: `@Roles(...roles)` decorator and `RolesGuard` (403 Forbidden)

- `@Roles(Role.Admin, Role.Member)` can be put on a **controller class** or a **route handler**. If both are present, the **handler wins**.
- A route without `@Roles` is open to any authenticated user.
- Authenticated but wrong role: **403**.
- Make `UsersController` admin-only with a **single class-level** decorator.
- Apply the rules from the table to `TasksController`.
- Make sure the guards run in the right order: you need to know *who* the user is before checking *what* they can do.

### Task 4: `@CurrentUser()` and ownership

- Create a parameter decorator: `@CurrentUser()` returns the authenticated user, and `@CurrentUser('id')` returns just one property.
- `GET /users/me` returns the caller's profile. It lives in the admin-only `UsersController` but must be allowed for **every** role (override at handler level).
- `POST /tasks`: the owner of the new task is **always the caller**. An `ownerId` sent in the body must be ignored (the response is still 201).
- `PATCH /tasks/:id`: a member editing a task they don't own gets **403** with the message `You can only modify your own tasks`. Admins can edit any task. The owner of a task can never be changed through `PATCH`.
- Unknown task: **404** (already implemented in the service).

### Task 5: Never leak tokens

`GET /users` and `GET /users/me` must never include the `token` field. Expected `GET /users/me` body for Brian:

```json
{ "id": 2, "name": "Brian Mugisha", "email": "brian@example.com", "role": "member" }
```

## Hints

- `APP_GUARD` and `Reflector` come from `@nestjs/core`. Look at `Reflector#getAllAndOverride`.
- Global guards registered with `APP_GUARD` run in the order they are provided.
- `ValidationPipe` is configured with `whitelist: true`: properties not declared in a DTO are stripped.

## How you will be evaluated

1. Automated tests (`npm test`) pass.
2. Code quality: reusable guards and decorators, no copy-pasted auth checks in handlers, correct 401 and 403 semantics.
