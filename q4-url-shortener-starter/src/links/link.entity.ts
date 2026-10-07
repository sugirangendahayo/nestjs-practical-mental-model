export interface Link {
  slug: string;
  url: string;
  clicks: number;
  createdAt: Date;
  expiresAt: Date | null;
  lastAccessedAt: Date | null;
}
