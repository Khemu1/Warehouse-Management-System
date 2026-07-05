import { Inventory } from '../inventory/entities/inventory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('warehouse')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  location: string;

  @Column({ nullable: true })
  user_id: string;

  @Column('numeric')
  capacity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Inventory, (inventory) => inventory.warehouse)
  inventoryItems: Inventory[];
}
