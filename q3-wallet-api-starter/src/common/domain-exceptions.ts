import { HttpException, HttpStatus } from "@nestjs/common";

export abstract class WalletException extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly code: string,
    message: string,
  ) {
    super({ statusCode: status, code, message }, status);
  }
}

export class WalletNotFoundException extends WalletException {
  constructor(id: string) {
    super(HttpStatus.NOT_FOUND, "WALLET_NOT_FOUND", `Wallet ${id} not found`);
  }
}

export class SameWalletTransferException extends WalletException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      "SAME_WALLET_TRANSFER",
      "Cannot transfer to the same wallet",
    );
  }
}

export class InsufficientFundsException extends WalletException {
  constructor(walletId: string, balance: number, requested: number) {
    super(
      HttpStatus.UNPROCESSABLE_ENTITY,
      "INSUFFICIENT_FUNDS",
      `Wallet ${walletId} has insufficient funds (balance ${balance.toFixed(2)}, requested ${requested.toFixed(2)})`,
    );
  }
}
