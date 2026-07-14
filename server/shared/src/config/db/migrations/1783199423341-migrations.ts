import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783199423341 implements MigrationInterface {
  name = "Migrations1783199423341";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "low_stock_threshold" TYPE integer USING "low_stock_threshold"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ALTER COLUMN "quantity" TYPE integer USING "quantity"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ALTER COLUMN "reserved_quantity" TYPE integer USING "reserved_quantity"::integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory" ALTER COLUMN "reserved_quantity" TYPE numeric USING "reserved_quantity"::numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ALTER COLUMN "quantity" TYPE numeric USING "quantity"::numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "low_stock_threshold" TYPE numeric USING "low_stock_threshold"::numeric`,
    );
  }
}
