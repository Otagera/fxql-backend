import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Currency } from './transactions.interface';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    length: 3,
  })
  sourceCurrency: string;

  @Column({
    length: 3,
  })
  destinationCurrency: string;

  @Column('decimal')
  sellPrice: number;

  @Column('decimal')
  buyPrice: number;

  @Column()
  capAmount: number;

  @Column()
  @CreateDateColumn()
  createdAt: number;

  @Column()
  @UpdateDateColumn()
  updateAt: number;

  @Column()
  @DeleteDateColumn()
  deletedAt: number;
}
