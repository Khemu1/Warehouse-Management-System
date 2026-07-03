import { Seeder } from 'typeorm-extension';
import { Product } from '../products/products.entity';
import { DataSource } from 'typeorm';

export class ProductSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Product);

    await repo.save([
      {
        name: 'Wireless Bluetooth Headphones',
        description:
          'Noise-cancelling wireless headphones with 30-hour battery life',
        sku: 'WBH-001',
        unit_price: 129.99,
        low_stock_threshold: 10,
      },
      {
        name: 'USB-C Charging Cable',
        description: '6ft braided USB-C fast charging cable',
        sku: 'USB-C-002',
        unit_price: 19.99,
        low_stock_threshold: 25,
      },
      {
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand with ventilation',
        sku: 'LS-003',
        unit_price: 49.99,
        low_stock_threshold: 15,
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with Cherry MX switches',
        sku: 'MK-004',
        unit_price: 149.99,
        low_stock_threshold: 8,
      },
      {
        name: 'Webcam HD Pro',
        description: '1080p HD webcam with auto-focus and built-in microphone',
        sku: 'WC-005',
        unit_price: 79.99,
        low_stock_threshold: 12,
      },
      {
        name: 'Portable SSD 1TB',
        description: 'External SSD with USB 3.2, up to 1050MB/s read speed',
        sku: 'SSD-006',
        unit_price: 119.99,
        low_stock_threshold: 20,
      },
    ]);

    console.log('✅ Products seeded');
  }
}
