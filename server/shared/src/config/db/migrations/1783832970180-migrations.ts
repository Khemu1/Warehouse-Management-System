import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783832970180 implements MigrationInterface {
    name = 'Migrations1783832970180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "outbound_order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "outbound_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_cost" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c4dbf4245f64fb90dd4f91a5ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbound_order_status_enum" AS ENUM('pending', 'reserving', 'reserved', 'confirming', 'confirmed', 'cancelled', 'needs_attention')`);
        await queryRunner.query(`CREATE TABLE "outbound_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "warehouse_id" uuid NOT NULL, "customer_name" character varying NOT NULL, "status" "public"."outbound_order_status_enum" NOT NULL DEFAULT 'pending', "total_amount" integer NOT NULL DEFAULT '0', "items_total" integer NOT NULL DEFAULT '0', "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a2dae73882b32d50cdabea6bbb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "outbound_order_failure" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "item_id" uuid, "reason" character varying NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "resolved" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3a17bd164ef9813da1ae4ced19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_b2b54a9b26de0207934e543bfe5"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_c14c8fe82bd43c56ab57e02e98e" PRIMARY KEY ("id", "booking_id")`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_c14c8fe82bd43c56ab57e02e98e"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "booking_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "order_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_74e082f429ee4df792d54fb7c32" PRIMARY KEY ("id", "order_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_24e81ae2aaeb9b1549a2a9f641" ON "stock_movement" ("product_id", "warehouse_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_b6925649a5a4af55fa05ccbf7c" ON "stock_movement" ("idempotency_key") `);
        await queryRunner.query(`ALTER TABLE "outbound_order_item" ADD CONSTRAINT "FK_4fdf22a915daf77d9e562b39d4b" FOREIGN KEY ("outbound_order_id") REFERENCES "outbound_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbound_order_item" DROP CONSTRAINT "FK_4fdf22a915daf77d9e562b39d4b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6925649a5a4af55fa05ccbf7c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_24e81ae2aaeb9b1549a2a9f641"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_74e082f429ee4df792d54fb7c32"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "order_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "booking_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_c14c8fe82bd43c56ab57e02e98e" PRIMARY KEY ("id", "booking_id")`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "PK_c14c8fe82bd43c56ab57e02e98e"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "PK_b2b54a9b26de0207934e543bfe5" PRIMARY KEY ("id", "user_id", "booking_id")`);
        await queryRunner.query(`DROP TABLE "outbound_order_failure"`);
        await queryRunner.query(`DROP TABLE "outbound_order"`);
        await queryRunner.query(`DROP TYPE "public"."outbound_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "outbound_order_item"`);
    }

}
