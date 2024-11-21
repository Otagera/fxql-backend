export interface ITxn {
  EntryId: string;
  SourceCurrency: string;
  DestinationCurrency: string;
  SellPrice: number;
  BuyPrice: number;
  CapAmount: number;
}
export interface ITransaction extends IFXQL {
  id: number;
}

export interface IFXQL {
  sourceCurrency: string;
  destinationCurrency: string;
  sellPrice: number;
  buyPrice: number;
  capAmount: number;
}
