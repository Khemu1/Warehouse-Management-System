import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('outbound_order_failure')
export class OutboundOrderFailure {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') order_id: string;
  @Column('uuid', { nullable: true }) item_id: string | null;
  @Column('varchar') reason: string;
  @Column('int', { default: 0 }) attempts: number;
  @Column('boolean', { default: false }) resolved: boolean;

  @CreateDateColumn() created_at: Date;
}
