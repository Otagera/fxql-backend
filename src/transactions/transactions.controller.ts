import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateFXQLDto, createFXQLSchema } from './createFXQL.dto';

import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(
        'Validation failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/fxql-statements')
  @UsePipes(new ZodValidationPipe(createFXQLSchema))
  async postFXQL(@Body() createFXQLDto: CreateFXQLDto): Promise<object> {
    const txns = await this.transactionService.createFXQL(createFXQLDto);

    return {
      message: 'Rates Parsed Successfully.',
      code: 'FXQL-200',
      data: txns,
    };
  }
}
