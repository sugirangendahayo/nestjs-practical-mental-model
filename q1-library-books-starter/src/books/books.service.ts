import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Book, Paginated } from "./book.entity";
import { SEED_BOOKS } from "./books.seed";
import { CreateBookDto } from "./dto/create-book.dto";
import { QueryBooksDto } from "./dto/query-books.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BooksService {
  // In-memory "database". Each app instance gets its own copy of the seed data.
  private books: Book[] = SEED_BOOKS.map((b) => ({
    ...b,
    genres: [...b.genres],
  }));
  private nextId = this.books.length + 1;

  findAll(query: QueryBooksDto): Paginated<Book> {
    const author = query.author?.trim().toLowerCase();
    const genre = query.genre?.trim().toLowerCase();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filtered = this.books.filter((book) => {
      const matchesAuthor =
        !author || book.author.toLowerCase().includes(author);
      const matchesGenre =
        !genre || book.genres.some((g) => g.toLowerCase() === genre);
      const matchesAvailable =
        query.available === undefined || book.available === query.available;
      return matchesAuthor && matchesGenre && matchesAvailable;
    });

    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  findOne(id: number): Book {
    const book = this.books.find((item) => item.id === id);
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  create(dto: CreateBookDto): Book {
    const isbn = dto.isbn.trim();
    const existing = this.books.find((book) => book.isbn === isbn);
    if (existing) {
      throw new ConflictException(`A book with ISBN ${isbn} already exists`);
    }

    const book: Book = {
      id: this.nextId++,
      title: dto.title.trim(),
      author: dto.author.trim(),
      isbn,
      publishedYear: dto.publishedYear,
      genres: (dto.genres ?? []).map((genre) => genre.trim()),
      available: dto.available ?? true,
    };

    this.books.push(book);
    return book;
  }

  update(id: number, dto: UpdateBookDto): Book {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    const existing = this.books[index];
    const next = {
      ...existing,
      ...dto,
      title: dto.title?.trim() ?? existing.title,
      author: dto.author?.trim() ?? existing.author,
      isbn: dto.isbn?.trim() ?? existing.isbn,
      genres: dto.genres
        ? dto.genres.map((genre) => genre.trim())
        : existing.genres,
      available: dto.available ?? existing.available,
    };

    if (dto.isbn && dto.isbn !== existing.isbn) {
      const duplicate = this.books.some(
        (book) => book.id !== id && book.isbn === next.isbn,
      );
      if (duplicate) {
        throw new ConflictException(
          `A book with ISBN ${next.isbn} already exists`,
        );
      }
    }

    this.books[index] = next;
    return this.books[index];
  }

  remove(id: number): void {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    this.books.splice(index, 1);
  }
}
