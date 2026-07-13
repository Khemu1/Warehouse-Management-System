import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '@shared/types';

@Entity('payments')
@Index('one_active_payment_per_order', ['order_id'], {
  unique: true,
  where: `status != 'failed'`,
})
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('enum', { enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ default: 'mock' })
  payment_method: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column({ nullable: true })
  gateway_reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
