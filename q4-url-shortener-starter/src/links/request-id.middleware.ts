import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const incoming = req.headers["x-request-id"];
    const requestId = Array.isArray(incoming)
      ? incoming[0]
      : incoming || randomUUID();

    req.id = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  }
}
