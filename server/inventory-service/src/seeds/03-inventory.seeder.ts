import { Inventory } from '../inventory/entities/inventory.entity';
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

    const getWarehouse = (name: string) => {
      const warehouse = warehouses.find((w) => w.name === name);
      if (!warehouse)
        throw new Error(`Seed error: warehouse "${name}" not found`);
      return warehouse;
    };

    const getProduct = (sku: string) => {
      const product = products.find((p) => p.sku === sku);
      if (!product)
        throw new Error(`Seed error: product with sku "${sku}" not found`);
      return product;
    };

    await inventoryRepo.save([
      // Main Warehouse
      {
        warehouse: getWarehouse('Main Warehouse'),
        product: getProduct('WBH-001'),
        quantity: 50,
        reserved_quantity: 5,
      },
      {
        warehouse: getWarehouse('Main Warehouse'),
        product: getProduct('USB-C-002'),
        quantity: 200,
        reserved_quantity: 30,
      },
      {
        warehouse: getWarehouse('Main Warehouse'),
        product: getProduct('LS-003'),
        quantity: 75,
        reserved_quantity: 10,
      },
      {
        warehouse: getWarehouse('Main Warehouse'),
        product: getProduct('MK-004'),
        quantity: 25,
        reserved_quantity: 3,
      },
      {
        warehouse: getWarehouse('Main Warehouse'),
        product: getProduct('WC-005'),
        quantity: 40,
        reserved_quantity: 0,
      },
      {
        warehouse: getWarehouse('Main Warehouse'),
        product: getProduct('SSD-006'),
        quantity: 100,
        reserved_quantity: 15,
      },

      // West Coast Distribution
      {
        warehouse: getWarehouse('West Coast Distribution'),
        product: getProduct('WBH-001'),
        quantity: 30,
        reserved_quantity: 2,
      },
      {
        warehouse: getWarehouse('West Coast Distribution'),
        product: getProduct('USB-C-002'),
        quantity: 150,
        reserved_quantity: 20,
      },
      {
        warehouse: getWarehouse('West Coast Distribution'),
        product: getProduct('MK-004'),
        quantity: 20,
        reserved_quantity: 0,
      },

      // South Regional Hub
      {
        warehouse: getWarehouse('South Regional Hub'),
        product: getProduct('LS-003'),
        quantity: 45,
        reserved_quantity: 5,
      },
      {
        warehouse: getWarehouse('South Regional Hub'),
        product: getProduct('WC-005'),
        quantity: 35,
        reserved_quantity: 8,
      },
      {
        warehouse: getWarehouse('South Regional Hub'),
        product: getProduct('SSD-006'),
        quantity: 60,
        reserved_quantity: 10,
      },

      // Midwest Center
      {
        warehouse: getWarehouse('Midwest Center'),
        product: getProduct('WBH-001'),
        quantity: 20,
        reserved_quantity: 0,
      },
      {
        warehouse: getWarehouse('Midwest Center'),
        product: getProduct('USB-C-002'),
        quantity: 100,
        reserved_quantity: 15,
      },
      {
        warehouse: getWarehouse('Midwest Center'),
        product: getProduct('MK-004'),
        quantity: 15,
        reserved_quantity: 2,
      },
    ]);

    console.log('✅ Inventory seeded');
  }
}
