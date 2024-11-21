import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['sourceCurrency', 'destinationCurrency'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
