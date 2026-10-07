export interface Transfer {
  id: string; // "T-0001", "T-0002", ...
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  createdAt: string; // ISO 8601
}
