import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transactions.entity';
import { CreateFXQLDto } from './createFXQL.dto';
import { IFXQL, ITxn } from './transactions.interface';

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
  async createFXQL(data: CreateFXQLDto): Promise<ITxn[]> {
    const regex =
      /^([A-Z]{3,3})-([A-Z]{3,3})\s{\s*\n\s*BUY\s+(\d*\.?\d+)\s*\n\s*SELL\s+(\d*\.?\d+)\s*\n\s*CAP\s+(\d+)\s*\n\s*}\s*\n*\s*/gm;
    const cleaned = data.FXQL.replace(/\\n/g, '\n');

    let match: RegExpExecArray;
    let count = 0;
    if (cleaned.match(regex).length > 1000) {
      throw new HttpException(
        'You have exceeded the maximum 1000 currency pairss per request',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const pairs = new Map<string, IFXQL>();
    while ((match = regex.exec(cleaned)) !== null && count++ < 1000) {
      const sourceCurrency = match[1] as string;
      const destinationCurrency = match[2] as string;
      pairs.set(`${sourceCurrency}-${destinationCurrency}`, {
        sourceCurrency,
        destinationCurrency,
        buyPrice: parseFloat(match[3]),
        sellPrice: parseFloat(match[4]),
        capAmount: parseInt(match[5], 10),
      });
    }

    const finds: Promise<Transaction>[] = [];
    const txs: Promise<Transaction>[] = [];
    pairs.forEach((value) => {
      const _match = value;
      finds.push(
        this.repo.findOne({
          where: {
            sourceCurrency: _match.sourceCurrency,
            destinationCurrency: _match.destinationCurrency,
          },
        }),
      );
    });

    const resolvedFinds = await Promise.all(finds);
    let index = 0;
    for (const [key, _match] of pairs) {
      let _find = resolvedFinds[index++];

      if (_find) {
        _find.buyPrice = _match.buyPrice;
        _find.sellPrice = _match.sellPrice;
        _find.capAmount = _match.capAmount;
      } else {
        _find = this.repo.create(_match);
      }

      txs.push(this.repo.save(_find));
    }

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
