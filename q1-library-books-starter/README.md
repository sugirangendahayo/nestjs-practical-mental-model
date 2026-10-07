# Question 1 — Library Books API

**Focus:** DTOs, `class-validator` / `class-transformer`, `ValidationPipe`, built-in pipes, mapped types, HTTP exceptions
**Level:** Intermediate · **Suggested time:** 60 minutes

## Scenario

A community library wants a small REST API to manage its catalogue. Someone started the project: the module, the service and an in-memory list of 12 books are ready, but only `GET /books` works and **nothing is validated**. Finish the API so it is safe to put in front of the public.

## Getting started

1. The dev server (`npm run start:dev`) starts automatically and reloads when you save. The preview shows `GET /`.
2. Open a **new terminal** and run `npm test` to run the acceptance tests (`npm run test:watch` re-runs them on every save).
3. To try any request by hand (POST, PATCH, DELETE…), use the helper script, for example:
   ```bash
   npm run http -- GET "/books?author=adichie"
   npm run http -- POST /books '{"title":"Dune","author":"Frank Herbert","isbn":"9780441172719","publishedYear":1965}'
   ```
4. At the start almost every test fails. Your goal is to make **all** of them pass.

**Rules:** do not modify anything in `test/` or `src/books/books.seed.ts`. You may add files, providers, helpers, and so on as you see fit.

## Data model

```ts
interface Book {
  id: number;            // auto-increment, seed uses 1..12
  title: string;
  author: string;
  isbn: string;          // 13 digits, starts with 978 or 979
  publishedYear: number;
  genres: string[];
  available: boolean;
}
```

## Tasks

### Task 1: Global validation

In `src/app.setup.ts` (used by both `main.ts` and the tests), register a global `ValidationPipe` so that:

- a request containing a property that is **not declared** in the DTO is rejected with **400** (not silently ignored);
- request data is **transformed** into instances of the DTO classes (so default values and type conversion work).

### Task 2: `POST /books`

Create a book. Body rules:

| Field           | Rules                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- |
| `title`         | required string, **trimmed**, must not be empty after trimming, max 200 characters        |
| `author`        | required string, **trimmed**, must not be empty after trimming                            |
| `isbn`          | required string of exactly 13 digits starting with `978` or `979`                         |
| `publishedYear` | required **integer** JSON number between 1450 and the current year (`"1995"` is rejected) |
| `genres`        | optional array of at most 5 non-empty strings, default `[]`                               |
| `available`     | optional JSON boolean (`"yes"` is rejected), default `true`                               |

- Success: **201** with the created book. Ids continue after the seed data (the first new book is `13`).
- Invalid body: **400**. Every validation message must mention the field name (the default class-validator messages already do).
- An ISBN that already exists: **409** with the message `A book with ISBN <isbn> already exists`.

```http
POST /books
{ "title": "The Mythical Man-Month", "author": "Frederick P. Brooks Jr.", "isbn": "9780201835953", "publishedYear": 1995 }

201 Created
{ "id": 13, "title": "The Mythical Man-Month", "author": "Frederick P. Brooks Jr.", "isbn": "9780201835953",
  "publishedYear": 1995, "genres": [], "available": true }
```

### Task 3: `GET /books` with filters and pagination

| Query param | Rules                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| `author`    | optional, case-insensitive **partial** match (`martin` matches "Robert C. Martin") |
| `genre`     | optional, case-insensitive **exact** match against one of the book's genres |
| `available` | optional, only the values `true` and `false` are accepted                   |
| `page`      | optional integer ≥ 1, default `1`                                           |
| `limit`     | optional integer between 1 and 50, default `10`                             |

- Filters are combined with AND. Pagination is applied **after** filtering; results are ordered by `id`.
- Invalid values (`page=0`, `limit=51`, `page=abc`, `page=1.5`, `available=maybe`…) give **400**.
- Response shape (`Paginated<Book>` in `book.entity.ts`):

```json
{
  "data": [ { "id": 4, "...": "..." } ],
  "meta": { "total": 5, "page": 2, "limit": 2, "totalPages": 3 }
}
```

`meta.total` is the number of books matching the filters, before pagination. A page past the end returns `"data": []`.

### Task 4: `GET /books/:id`

- **400** if `id` is not an integer (e.g. `/books/abc`).
- **404** with the message `Book with id <id> not found` if it does not exist.

### Task 5: `PATCH /books/:id`

- Partially updates a book and returns **200** with the full updated book.
- Every field is optional, but provided fields follow **the same rules as in Task 2**. Build `UpdateBookDto` **without copy-pasting** the decorators.
- `id` cannot be changed (it's an unknown property, so **400**).
- **404** for an unknown book. **409** if the new ISBN belongs to *another* book (keeping the book's own ISBN is fine).

### Task 6: `DELETE /books/:id`

- **204 No Content** with an empty body; the book disappears from every endpoint.
- **404** for an unknown book.

## Hints

- `@nestjs/mapped-types`, `class-validator` and `class-transformer` are already installed.
- Query-string values always arrive as **text**. Make sure `?available=false` really returns the 3 unavailable books.
- Keep controllers thin: HTTP concerns in the controller, business rules in the service.

## How you will be evaluated

1. Automated tests (`npm test`) pass.
2. Code quality: correct use of NestJS building blocks, correct status codes, no duplicated validation rules, readable code.
