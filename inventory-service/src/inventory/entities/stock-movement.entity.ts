import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('stock_movement')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  idempotency_key: string; // e.g. `${order_id}:${item_id}`

  @Column('uuid') warehouse_id: string;
  @Column('uuid') product_id: string;
  @Column('int') quantity: number;
  @Column('varchar') type:
    | 'inbound_receive'
    | 'reservation'
    | 'commit'
    | 'reversal';

  @CreateDateColumn() created_at: Date;
}
