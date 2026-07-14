import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1784069136150 implements MigrationInterface {
  name = "Migrations1784069136150";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fill null SKUs first
    await queryRunner.query(`
            UPDATE "product" 
            SET "sku" = CONCAT('TEMP-', SUBSTRING("id"::text, 1, 8)) 
            WHERE "sku" IS NULL
        `);

    // Make SKU NOT NULL and UNIQUE (alter existing column, don't drop)
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "sku" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku")`,
    );

    // Add CASCADE to inventory foreign keys
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove CASCADE
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Remove unique constraint
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "sku" DROP NOT NULL`,
    );
  }
}
