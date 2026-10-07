import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { SlugGenerator } from './links.constants';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Production slug generator: 6 random base-62 characters. Already complete. */
@Injectable()
export class RandomSlugGenerator implements SlugGenerator {
  generate(): string {
    return Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  }
}
