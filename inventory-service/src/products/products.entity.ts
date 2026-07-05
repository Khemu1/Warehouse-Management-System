import { Inventory } from '../inventory/entities/inventory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  sku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('integer')
  low_stock_threshold: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventoryItems: Inventory[];
}
