import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
  PipeTransform,
  ArgumentMetadata,
  Res,
} from '@nestjs/common';
import { ZodSchema } from 'zod';
import { Response } from 'express';

import { ITxn } from './transactions.interface';
import { ApiBody, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transactions.service';
import { CreateFXQLDTO, createFXQLSchema } from './createFXQL.dto';
import { dummy } from './dummy';

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

  /**
   * Parse FXQL statements
   *
   * @remarks This operation allows you to parse FXQL statements.
   */
  @Post('/fxql-statements')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The record has been successfully created.',
    type: CreateFXQLDTO,
    example: {
      message: 'Rates Parsed Successfully.',
      code: 'FXQL-200',
      data: [
        {
          EntryId: 'a1996bfd-2382-49a2-bd96-bf3afef18b66',
          SourceCurrency: 'USD',
          DestinationCurrency: 'GBP',
          SellPrice: 200,
          BuyPrice: 100,
          CapAmount: 93800,
        },
        '...',
      ],
    },
  })
  @ApiCreatedResponse({ content: null })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Exceeded the maximum 1000 currency pairs per request',
    type: CreateFXQLDTO,
    example: {
      message: 'You have exceeded the maximum 1000 currency pairs per request',
      code: `FXQL-${HttpStatus.UNPROCESSABLE_ENTITY}`,
    },
  })
  @ApiBody({
    type: CreateFXQLDTO,
    examples: {
      example1: {
        summary: 'Single currency exchange',
        description: 'This is an example of a single exchange to parse.',
        value: {
          FXQL: `LZZ-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}`,
        },
      },
      example2: {
        summary: 'Multiple currency exchange',
        description: 'This is an example of a multiple exchange to parse.',
        value: {
          FXQL: `USD-GBP {\\n  BUY 0.85\\n  SELL 0.90\\n  CAP 10000\\n}\\n\\nEUR-JPY {\\n  BUY 145.20\\n  SELL 146.50\\n  CAP 50000\\n}\\n\\nNGN-USD {\\n  BUY 0.0022\\n  SELL 0.0023\\n  CAP 2000000\\n}`,
        },
      },
      example3: {
        summary: 'Exceeding 1000 currency exchanges',
        description: 'This is an example of exchange to parse exceeding 1000 .',
        value: dummy,
      },
    },
  })
  @UsePipes(new ZodValidationPipe(createFXQLSchema))
  async postFXQL(
    @Body() createFXQLDto: CreateFXQLDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
    code: string;
    data?: ITxn[];
  }> {
    try {
      const txns = await this.transactionService.createFXQL(createFXQLDto);
      res.status(HttpStatus.OK);
      return {
        message: 'Rates Parsed Successfully.',
        code: `FXQL-${HttpStatus.OK}`,
        data: txns,
      };
    } catch (error) {
      console.log('error', error);
      res.status(error.status);
      return {
        message: error.message,
        code: `FXQL-${error?.status || 500}`,
      };
    }
  }
}
