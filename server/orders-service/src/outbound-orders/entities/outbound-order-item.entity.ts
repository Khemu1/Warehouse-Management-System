// outbound-order-item.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OutboundOrder } from './outbound-order.entity';

@Entity('outbound_order_item')
export class OutboundOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outbound_order_id: string;

  @ManyToOne(() => OutboundOrder, (order) => order.outbound_items, {
    cascade: ['remove', 'update'],
  })
  @JoinColumn({ name: 'outbound_order_id' })
  order: OutboundOrder;

  @Column('uuid')
  product_id: string;

  @Column('integer')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
