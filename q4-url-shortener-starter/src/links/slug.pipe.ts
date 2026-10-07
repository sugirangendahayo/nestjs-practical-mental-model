import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class SlugPipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value !== "string" || !/^[A-Za-z0-9-]{4,20}$/.test(value)) {
      throw new BadRequestException("Invalid slug");
    }

    return value;
  }
}
