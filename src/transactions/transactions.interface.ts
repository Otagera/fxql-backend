export enum Currency {
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
}

export interface ITransaction extends IFXQL {
  id: number;
}

export interface IFXQL {
  sourceCurrency: Currency;
  destinationCurrency: Currency;
  sellPrice: number;
  buyPrice: number;
  capAmount: number;
}
