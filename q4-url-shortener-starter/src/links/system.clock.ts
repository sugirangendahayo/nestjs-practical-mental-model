import { Injectable } from '@nestjs/common';
import { Clock } from './links.constants';

/** Production clock. Already complete. */
@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
