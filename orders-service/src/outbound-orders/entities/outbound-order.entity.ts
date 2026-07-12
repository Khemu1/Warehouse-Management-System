import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OutboundOrderStatus } from '@shared/types';
import { OutboundOrderItem } from './outbound-order-item.entity';
@Entity('outbound_order')
export class OutboundOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  warehouse_id: string;

  @Column('varchar')
  customer_name: string;

  @Column({
    type: 'enum',
    enum: OutboundOrderStatus,
    default: OutboundOrderStatus.PENDING,
  })
  status: OutboundOrderStatus;

  @Column('integer', { default: 0 })
  total_amount: number;

  @Column('integer', { default: 0 })
  total_products: number;

  @Column('uuid')
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OutboundOrderItem, (item) => item.order)
  outbound_items: OutboundOrderItem[];
}
