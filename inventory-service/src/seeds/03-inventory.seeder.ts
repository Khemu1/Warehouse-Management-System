import { Inventory } from '../inventory/inventory.entity';
import { Product } from '../products/products.entity';
import { Warehouse } from '../warehouses/warehouse.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class InventorySeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const inventoryRepo = dataSource.getRepository(Inventory);
    const warehouseRepo = dataSource.getRepository(Warehouse);
    const productRepo = dataSource.getRepository(Product);

    const warehouses = await warehouseRepo.find();
    const products = await productRepo.find();

    if (warehouses.length === 0 || products.length === 0) {
      console.log(
        '⚠️  No warehouses or products found. Run WarehouseSeeder and ProductSeeder first.',
      );
      return;
    }

    // Helper function to find entities by index (optional, for cleaner code)
    const getWarehouse = (index: number) => warehouses[index];
    const getProduct = (index: number) => products[index];

    await inventoryRepo.save([
      // Main Warehouse (index 0)
      {
        name: 'WBH-001-Main',
        warehouse: getWarehouse(0),
        product: getProduct(0),
        quantity: 50,
        reserved_quantity: 5,
      },
      {
        name: 'USB-C-002-Main',
        warehouse: getWarehouse(0),
        product: getProduct(1),
        quantity: 200,
        reserved_quantity: 30,
      },
      {
        name: 'LS-003-Main',
        warehouse: getWarehouse(0),
        product: getProduct(2),
        quantity: 75,
        reserved_quantity: 10,
      },
      {
        name: 'MK-004-Main',
        warehouse: getWarehouse(0),
        product: getProduct(3),
        quantity: 25,
        reserved_quantity: 3,
      },
      {
        name: 'WC-005-Main',
        warehouse: getWarehouse(0),
        product: getProduct(4),
        quantity: 40,
        reserved_quantity: 0,
      },
      {
        name: 'SSD-006-Main',
        warehouse: getWarehouse(0),
        product: getProduct(5),
        quantity: 100,
        reserved_quantity: 15,
      },
      // West Coast Distribution (index 1)
      {
        name: 'WBH-001-West',
        warehouse: getWarehouse(1),
        product: getProduct(0),
        quantity: 30,
        reserved_quantity: 2,
      },
      {
        name: 'USB-C-002-West',
        warehouse: getWarehouse(1),
        product: getProduct(1),
        quantity: 150,
        reserved_quantity: 20,
      },
      {
        name: 'MK-004-West',
        warehouse: getWarehouse(1),
        product: getProduct(3),
        quantity: 20,
        reserved_quantity: 0,
      },
      // South Regional Hub (index 2)
      {
        name: 'LS-003-South',
        warehouse: getWarehouse(2),
        product: getProduct(2),
        quantity: 45,
        reserved_quantity: 5,
      },
      {
        name: 'WC-005-South',
        warehouse: getWarehouse(2),
        product: getProduct(4),
        quantity: 35,
        reserved_quantity: 8,
      },
      {
        name: 'SSD-006-South',
        warehouse: getWarehouse(2),
        product: getProduct(5),
        quantity: 60,
        reserved_quantity: 10,
      },
      // Midwest Center (index 3)
      {
        name: 'WBH-001-Midwest',
        warehouse: getWarehouse(3),
        product: getProduct(0),
        quantity: 20,
        reserved_quantity: 0,
      },
      {
        name: 'USB-C-002-Midwest',
        warehouse: getWarehouse(3),
        product: getProduct(1),
        quantity: 100,
        reserved_quantity: 15,
      },
      {
        name: 'MK-004-Midwest',
        warehouse: getWarehouse(3),
        product: getProduct(3),
        quantity: 15,
        reserved_quantity: 2,
      },
    ]);

    console.log('✅ Inventory seeded');
  }
}
