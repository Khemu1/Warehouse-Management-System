import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InBoundOrderStatus } from '@shared/types';
import { InboundOrderItem } from './inbound-order-item.entity';
@Entity('inbound_order')
export class InboundOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  warehouse_id: string;

  @Column('varchar')
  supplier_name: string;

  @Column({
    type: 'enum',
    enum: InBoundOrderStatus,
    default: InBoundOrderStatus.PENDING,
  })
  status: InBoundOrderStatus;

  @Column('integer')
  total_amount: number;

  @Column('uuid')
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => InboundOrderItem, (item) => item.order)
  inbound_items: InboundOrderItem[];
}
