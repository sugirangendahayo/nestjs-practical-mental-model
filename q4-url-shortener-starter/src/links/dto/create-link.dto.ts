import { Transform } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
} from "class-validator";

export class CreateLinkDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
  url: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Matches(/^[A-Za-z0-9-]{4,20}$/)
  customSlug?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? Number.NaN : value))
  @IsInt()
  @Min(1)
  @Max(525600)
  expiresInMinutes?: number;
}
