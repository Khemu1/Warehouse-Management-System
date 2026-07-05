import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783269939106 implements MigrationInterface {
    name = 'Migrations1783269939106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stock_movement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idempotency_key" character varying NOT NULL, "warehouse_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b6925649a5a4af55fa05ccbf7c0" UNIQUE ("idempotency_key"), CONSTRAINT "PK_9fe1232f916686ae8cf00294749" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inbound_order_item" ADD "unit_cost" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."inbound_order_status_enum" RENAME TO "inbound_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."inbound_order_status_enum" AS ENUM('pending', 'received', 'receiving', 'partially_received', 'cancelled', 'needs_attention')`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "status" TYPE "public"."inbound_order_status_enum" USING "status"::"text"::"public"."inbound_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."inbound_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "total_amount" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "total_amount" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."inbound_order_status_enum_old" AS ENUM('pending', 'received', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "status" TYPE "public"."inbound_order_status_enum_old" USING "status"::"text"::"public"."inbound_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "inbound_order" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."inbound_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."inbound_order_status_enum_old" RENAME TO "inbound_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "inbound_order_item" DROP COLUMN "unit_cost"`);
        await queryRunner.query(`DROP TABLE "stock_movement"`);
    }

}
