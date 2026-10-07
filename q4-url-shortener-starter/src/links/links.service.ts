import {
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  APP_CONFIG,
  APP_CONFIG as APP_CONFIG_TOKEN,
  AppConfig,
  CLOCK,
  Clock,
  SLUG_GENERATOR,
  SlugGenerator,
} from "./links.constants";
import { CreateLinkDto } from "./dto/create-link.dto";
import { Link } from "./link.entity";

@Injectable()
export class LinksService {
  private readonly links = new Map<string, Link>();

  constructor(
    @Inject(SLUG_GENERATOR) private readonly slugGenerator: SlugGenerator,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(APP_CONFIG_TOKEN) private readonly appConfig: AppConfig,
  ) {}

  create(dto: CreateLinkDto) {
    const slug = this.resolveSlug(dto.customSlug);
    const now = this.clock.now();
    const expiresAt = dto.expiresInMinutes
      ? new Date(now.getTime() + dto.expiresInMinutes * 60_000)
      : null;

    const link: Link = {
      slug,
      url: dto.url,
      clicks: 0,
      createdAt: new Date(now),
      expiresAt,
      lastAccessedAt: null,
    };

    this.links.set(slug, link);
    return this.serializeLink(link);
  }

  redirect(slug: string): { url: string; statusCode: number } {
    const link = this.getLink(slug);
    const now = this.clock.now();

    if (link.expiresAt && now.getTime() >= link.expiresAt.getTime()) {
      throw new GoneException();
    }

    link.clicks += 1;
    link.lastAccessedAt = new Date(now);

    return { url: link.url, statusCode: 302 };
  }

  stats(slug: string) {
    const link = this.getLink(slug);
    const now = this.clock.now();
    const expired =
      !!link.expiresAt && now.getTime() >= link.expiresAt.getTime();

    return {
      ...this.serializeLink(link),
      expired,
      lastAccessedAt: link.lastAccessedAt
        ? link.lastAccessedAt.toISOString()
        : null,
    };
  }

  private resolveSlug(customSlug?: string): string {
    if (customSlug) {
      if (this.links.has(customSlug)) {
        throw new ConflictException(`Slug "${customSlug}" is already in use`);
      }
      return customSlug;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = this.slugGenerator.generate();
      if (!this.links.has(candidate)) {
        return candidate;
      }
    }

    throw new ServiceUnavailableException(
      "Could not generate a unique slug, please retry",
    );
  }

  private getLink(slug: string): Link {
    const link = this.links.get(slug);
    if (!link) {
      throw new NotFoundException("Link not found");
    }
    return link;
  }

  private serializeLink(link: Link) {
    return {
      slug: link.slug,
      url: link.url,
      shortUrl: `${this.appConfig.baseUrl}/${link.slug}`,
      clicks: link.clicks,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    };
  }
}
