import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transactions.entity';
import { CreateFXQLDto } from './createFXQL.dto';
import { Currency, IFXQL } from './transactions.interface';

export type AliaserSpec<T> = {
  [key: string]: keyof T;
};

export function aliaser<T>(data: any, spec: AliaserSpec<T>): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

  const mappedObj: { [key in keyof T]?: T[key] } = {};

  Object.entries(spec).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      mappedObj[value] = data[key];
    }
  });

  return mappedObj as T;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction) private repo: Repository<Transaction>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  async createFXQL(data: CreateFXQLDto): Promise<object> {
    const regex =
      /^([A-Z]{3,3})-([A-Z]{3,3})\s{\s*\n\s*BUY\s+(\d*\.?\d+)\s*\n\s*SELL\s+(\d*\.?\d+)\s*\n\s*CAP\s+(\d+)\s*\n\s*}\s*\n*\s*/gm;
    const cleaned = data.FXQL.replace(/\\n/g, '\n');

    const matches: IFXQL[] = [];
    let match: RegExpExecArray;

    while ((match = regex.exec(cleaned)) !== null) {
      if (match.length < 6) {
        console.log('match', match);
      }
      matches.push({
        sourceCurrency: match[1] as Currency,
        destinationCurrency: match[2] as Currency,
        buyPrice: parseFloat(match[3]),
        sellPrice: parseFloat(match[4]),
        capAmount: parseInt(match[5], 10),
      });
    }

    const txs = matches.map((_match) => {
      const tx = this.repo.create(_match);
      return this.repo.save(tx);
    });

    return (await Promise.all(txs)).map((tx) =>
      aliaser(tx, {
        id: 'EntryId',
        sourceCurrency: 'SourceCurrency',
        destinationCurrency: 'DestinationCurrency',
        sellPrice: 'SellPrice',
        buyPrice: 'BuyPrice',
        capAmount: 'CapAmount',
      }),
    );
  }
}
