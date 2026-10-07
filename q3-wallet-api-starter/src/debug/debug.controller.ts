import { Controller, Get } from '@nestjs/common';

// Simulates an unexpected bug deep inside the app. Do not modify.
@Controller('debug')
export class DebugController {
  @Get('crash')
  crash() {
    throw new Error('DB connection failed: password "hunter2" rejected for user "wallet_admin"');
  }
}
