// inbound-order-item.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InboundOrder } from './inbound-order.entity';

@Entity('inbound_order_item')
export class InboundOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  inbound_order_id: string;

  @ManyToOne(() => InboundOrder, (order) => order.inbound_items, {
    cascade: ['remove', 'update'],
  })
  @JoinColumn({ name: 'inbound_order_id' })
  order: InboundOrder;

  @Column('uuid')
  product_id: string;

  @Column('integer')
  expected_quantity: number;

  @Column('integer', { default: 0 })
  received_quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
