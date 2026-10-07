import { Controller, Get } from "@nestjs/common";
import { RawResponse } from "./common/raw-response.decorator";

@Controller()
export class AppController {
  @Get()
  info() {
    return {
      name: "Wallet API",
      tryThese: [
        "GET /wallets",
        "GET /wallets/W-1001",
        "GET /wallets/W-9999",
        "GET /transfers",
        "GET /debug/crash",
        "GET /health",
      ],
      hint: 'Open a new terminal and run "npm test" to check your solution.',
    };
  }

  @RawResponse()
  @Get("health")
  health() {
    return { status: "ok" };
  }
}
