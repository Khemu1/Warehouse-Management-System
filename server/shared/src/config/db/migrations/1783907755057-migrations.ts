import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783907755057 implements MigrationInterface {
    name = 'Migrations1783907755057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "gateway_reference" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_74e082f429ee4df792d54fb7c32"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'confirmed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."outbound_order_status_enum" RENAME TO "outbound_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."outbound_order_status_enum" AS ENUM('pending', 'reserving', 'reserved', 'confirming', 'confirmed', 'cancelled', 'cancelling', 'needs_attention')`);
        await queryRunner.query(`ALTER TABLE "outbound_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "outbound_order" ALTER COLUMN "status" TYPE "public"."outbound_order_status_enum" USING "status"::"text"::"public"."outbound_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "outbound_order" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."outbound_order_status_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "one_active_payment_per_order" ON "payments" ("order_id") WHERE status != 'failed'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."one_active_payment_per_order"`);
        await queryRunner.query(`CREATE TYPE "public"."outbound_order_status_enum_old" AS ENUM('pending', 'reserving', 'reserved', 'confirming', 'confirmed', 'cancelled', 'needs_attention')`);
        await queryRunner.query(`ALTER TABLE "outbound_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "outbound_order" ALTER COLUMN "status" TYPE "public"."outbound_order_status_enum_old" USING "status"::"text"::"public"."outbound_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "outbound_order" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."outbound_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."outbound_order_status_enum_old" RENAME TO "outbound_order_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum_old" AS ENUM('confirmed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_74e082f429ee4df792d54fb7c32" PRIMARY KEY ("id", "order_id")`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "gateway_reference"`);
    }

}
