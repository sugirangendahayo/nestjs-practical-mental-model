import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

export class CreateBookDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  author: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Matches(/^97[89]\d{10}$/)
  isbn: string;

  @Transform(({ value }) => (typeof value === "string" ? Number.NaN : value))
  @IsInt()
  @Min(1450)
  @Max(new Date().getFullYear())
  publishedYear: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.map((item) => (typeof item === "string" ? item.trim() : item));
  })
  @IsString({ each: true })
  @Matches(/.+/, { each: true })
  genres?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
    return value;
  })
  @IsIn([true, false])
  available?: boolean;
}
