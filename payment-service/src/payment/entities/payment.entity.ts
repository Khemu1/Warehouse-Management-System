import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '@shared/types';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn('uuid')
  order_id: string;

  @Column('enum', { enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ default: 'mock' })
  payment_method: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
