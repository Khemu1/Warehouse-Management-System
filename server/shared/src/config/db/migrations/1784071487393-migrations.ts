import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1784071487393 implements MigrationInterface {
  name = "Migrations1784071487393";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Don't drop SKU — just alter the existing column
    // If changing type from text to varchar:
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "sku" TYPE character varying`,
    );

    // Ensure NOT NULL (data already has values, so this is safe)
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "sku" SET NOT NULL`,
    );

    // Warehouse capacity: change from numeric to integer
    await queryRunner.query(
      `ALTER TABLE "warehouse" ALTER COLUMN "capacity" TYPE integer USING (capacity::integer)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "warehouse" ALTER COLUMN "capacity" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "sku" TYPE text`,
    );
  }
}
