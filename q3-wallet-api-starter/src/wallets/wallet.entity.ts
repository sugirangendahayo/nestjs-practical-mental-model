export interface Wallet {
  id: string; // e.g. "W-1001"
  owner: string;
  currency: 'USD';
  balance: number; // in dollars, always exactly 2 decimal places (e.g. 40.5 means $40.50)
}
