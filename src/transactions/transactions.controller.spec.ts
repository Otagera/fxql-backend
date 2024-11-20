import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';

describe('TransactionController', () => {
  let transactionController: TransactionController;

  beforeEach(async () => {
    const transaction: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [TransactionService],
    }).compile();

    transactionController = transaction.get<TransactionController>(
      TransactionController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(transactionController.postFXQL({})).toBe('Hello World!');
    });
  });
});
