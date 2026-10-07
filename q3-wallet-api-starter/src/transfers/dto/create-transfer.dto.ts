import { IsNumber, IsPositive, IsString, Matches, Max } from 'class-validator';

// Already complete - you do not need to change this file.
export class CreateTransferDto {
  @IsString()
  @Matches(/^W-\d{4}$/, { message: 'fromWalletId must look like W-1234' })
  fromWalletId: string;

  @IsString()
  @Matches(/^W-\d{4}$/, { message: 'toWalletId must look like W-1234' })
  toWalletId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(1_000_000)
  amount: number;
}
