import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class Events {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  organizer_id: string | null;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;

  @Column('date')
  date: Date;

  @Column('varchar')
  location: string;

  @Column('int')
  total_seats: number;

  @Column('int')
  available_seats: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
