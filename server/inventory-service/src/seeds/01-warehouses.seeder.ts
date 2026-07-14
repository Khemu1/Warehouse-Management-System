import { Seeder } from 'typeorm-extension';
import { Warehouse } from '../warehouses/warehouse.entity';
import { DataSource } from 'typeorm';

export class WarehouseSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Warehouse);

    await repo.save([
      {
        name: 'Main Warehouse',
        location: 'New York, NY',
        capacity: 10000,
      },
      {
        name: 'West Coast Distribution',
        location: 'Los Angeles, CA',
        capacity: 7500,
      },
      {
        name: 'South Regional Hub',
        location: 'Atlanta, GA',
        capacity: 5000,
      },
      {
        name: 'Midwest Center',
        location: 'Chicago, IL',
        capacity: 6000,
      },
    ]);

    console.log('✅ Warehouses seeded');
  }
}
