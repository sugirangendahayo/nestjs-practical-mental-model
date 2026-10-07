export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string; // 13 digits, starts with 978 or 979
  publishedYear: number;
  genres: string[];
  available: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number; // number of items matching the filters (before pagination)
    page: number;
    limit: number;
    totalPages: number;
  };
}
