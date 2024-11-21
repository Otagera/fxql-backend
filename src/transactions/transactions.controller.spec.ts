import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './transactions.entity';
import { IFXQL } from './transactions.interface';
import { Response } from 'express';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  const mockRes = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest
              .fn()
              .mockImplementation((fxql: IFXQL) =>
                Promise.resolve({ id: 'a uuid', ...fxql }),
              ),
            save: jest
              .fn()
              .mockImplementation((tx: Transaction) => Promise.resolve({ tx })),
          },
        },
      ],
    }).compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
  });

  describe('create FXQL', () => {
    it('should return parsed FXQL', async () => {
      const fxql = `USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}`;
      const res = new Response();
      const data = await transactionController.postFXQL(
        {
          FXQL: Array(10).fill(fxql).join(`\\n\\n`),
        },
        mockRes,
      );
      expect(data).toHaveProperty('message', 'Rates Parsed Successfully.');
      expect(data).toHaveProperty('code', 'FXQL-200');
      expect(data).toHaveProperty('data');
      expect(data.data).toBeTruthy();
      expect(data.data.length).toBe(10);
    });
  });

  it('should fail to parse FXQL 1001 requests', async () => {
    const fxql = `USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}`;

    const data = await transactionController.postFXQL(
      {
        FXQL: Array(1001).fill(fxql).join(`\\n\\n`),
      },
      mockRes,
    );
    expect(data).toHaveProperty(
      'message',
      'You have exceeded the maximum 1000 currency pairs per request',
    );
    expect(data).toHaveProperty('code', 'FXQL-422');
    expect(data.data).not.toBeTruthy();
  });
});
