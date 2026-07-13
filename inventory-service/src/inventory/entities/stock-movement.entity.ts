import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('stock_movement')
@Index(['idempotency_key']) // For idempotency checks
@Index(['product_id', 'warehouse_id', 'created_at']) // For inventory queries
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
    | 'outbound_ship'
    | 'reversal';

  @CreateDateColumn() created_at: Date;
}
