import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783901921177 implements MigrationInterface {
  name = "Migrations1783901921177";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ADD "cancalled_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."outbound_order_status_enum" RENAME TO "outbound_order_status_enum_old"`,
    );
    // Remove the duplicate 'cancelled' value
    await queryRunner.query(
      `CREATE TYPE "public"."outbound_order_status_enum" AS ENUM('pending', 'reserving', 'reserved', 'confirming', 'confirmed', 'cancelled', 'needs_attention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ALTER COLUMN "status" TYPE "public"."outbound_order_status_enum" USING "status"::"text"::"public"."outbound_order_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."outbound_order_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."outbound_order_status_enum_old" AS ENUM('pending', 'reserving', 'reserved', 'confirming', 'confirmed', 'cancelled', 'needs_attention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ALTER COLUMN "status" TYPE "public"."outbound_order_status_enum_old" USING "status"::"text"::"public"."outbound_order_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."outbound_order_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."outbound_order_status_enum_old" RENAME TO "outbound_order_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbound_order" DROP COLUMN "cancalled_by"`,
    );
  }
}
