import { Injectable } from "@nestjs/common";
import {
  InsufficientFundsException,
  SameWalletTransferException,
} from "../common/domain-exceptions";
import { WalletsService } from "../wallets/wallets.service";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { Transfer } from "./transfer.entity";

@Injectable()
export class TransfersService {
  private readonly transfers: Transfer[] = [];

  constructor(private readonly walletsService: WalletsService) {}

  findAll(): Transfer[] {
    return this.transfers;
  }

  create(dto: CreateTransferDto): Transfer {
    if (dto.fromWalletId === dto.toWalletId) {
      throw new SameWalletTransferException();
    }

    const from = this.walletsService.findOne(dto.fromWalletId);
    const to = this.walletsService.findOne(dto.toWalletId);

    const amountInCents = Math.round((dto.amount + Number.EPSILON) * 100);
    const fromBalanceInCents = Math.round(
      (from.balance + Number.EPSILON) * 100,
    );

    if (fromBalanceInCents < amountInCents) {
      throw new InsufficientFundsException(from.id, from.balance, dto.amount);
    }

    const nextFromBalance = Number(
      ((fromBalanceInCents - amountInCents) / 100).toFixed(2),
    );
    const nextToBalance = Number(
      (
        (Math.round((to.balance + Number.EPSILON) * 100) + amountInCents) /
        100
      ).toFixed(2),
    );

    from.balance = nextFromBalance;
    to.balance = nextToBalance;

    const transfer: Transfer = {
      id: `T-${String(this.transfers.length + 1).padStart(4, "0")}`,
      fromWalletId: from.id,
      toWalletId: to.id,
      amount: Number((amountInCents / 100).toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    this.transfers.push(transfer);
    return transfer;
  }
}
