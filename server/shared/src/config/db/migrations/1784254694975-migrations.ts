import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1784254694975 implements MigrationInterface {
    name = 'Migrations1784254694975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'staff')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'staff', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "sku" character varying NOT NULL, "unit_price" numeric(10,2) NOT NULL, "low_stock_threshold" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "warehouse_id" uuid, "product_id" uuid, "quantity" integer NOT NULL, "reserved_quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "warehouse" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "location" character varying(255) NOT NULL, "user_id" character varying, "capacity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_965abf9f99ae8c5983ae74ebde8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stock_movement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idempotency_key" character varying NOT NULL, "warehouse_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b6925649a5a4af55fa05ccbf7c0" UNIQUE ("idempotency_key"), CONSTRAINT "PK_9fe1232f916686ae8cf00294749" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_24e81ae2aaeb9b1549a2a9f641" ON "stock_movement" ("product_id", "warehouse_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_b6925649a5a4af55fa05ccbf7c" ON "stock_movement" ("idempotency_key") `);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'confirmed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "status" "public"."payments_status_enum" NOT NULL, "payment_method" character varying NOT NULL DEFAULT 'mock', "total_amount" numeric(10,2) NOT NULL, "gateway_reference" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "one_active_payment_per_order" ON "payments" ("order_id") WHERE status != 'failed'`);
        await queryRunner.query(`CREATE TABLE "outbound_order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "outbound_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_cost" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c4dbf4245f64fb90dd4f91a5ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbound_order_status_enum" AS ENUM('pending', 'reserving', 'reserved', 'confirming', 'SHIPPED', 'confirmed', 'cancelled', 'cancelling', 'needs_attention')`);
        await queryRunner.query(`CREATE TABLE "outbound_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "warehouse_id" uuid NOT NULL, "confirmed_by" uuid, "cancelled_by" uuid, "customer_name" character varying NOT NULL, "status" "public"."outbound_order_status_enum" NOT NULL DEFAULT 'pending', "total_amount" integer NOT NULL DEFAULT '0', "total_products" integer NOT NULL DEFAULT '0', "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "confirmed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a2dae73882b32d50cdabea6bbb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "outbound_order_failure" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "item_id" uuid, "reason" character varying NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "resolved" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3a17bd164ef9813da1ae4ced19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inbound_order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inbound_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "expected_quantity" integer NOT NULL, "received_quantity" integer NOT NULL DEFAULT '0', "unit_cost" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5ba8a49ec23c90a7a16313171f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inbound_order_status_enum" AS ENUM('pending', 'received', 'receiving', 'partially_received', 'cancelled', 'needs_attention')`);
        await queryRunner.query(`CREATE TABLE "inbound_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "warehouse_id" uuid NOT NULL, "supplier_name" character varying NOT NULL, "status" "public"."inbound_order_status_enum" NOT NULL DEFAULT 'pending', "total_amount" integer NOT NULL DEFAULT '0', "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee61b2a979421005c2dbb25c821" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inbound_order_failure" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "item_id" uuid, "reason" character varying NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "resolved" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4453870ddce294e2f5d2ab80b2c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "outbound_order_item" ADD CONSTRAINT "FK_4fdf22a915daf77d9e562b39d4b" FOREIGN KEY ("outbound_order_id") REFERENCES "outbound_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inbound_order_item" ADD CONSTRAINT "FK_b7be6a130d2ae253a4766f5d032" FOREIGN KEY ("inbound_order_id") REFERENCES "inbound_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inbound_order_item" DROP CONSTRAINT "FK_b7be6a130d2ae253a4766f5d032"`);
        await queryRunner.query(`ALTER TABLE "outbound_order_item" DROP CONSTRAINT "FK_4fdf22a915daf77d9e562b39d4b"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649"`);
        await queryRunner.query(`DROP TABLE "inbound_order_failure"`);
        await queryRunner.query(`DROP TABLE "inbound_order"`);
        await queryRunner.query(`DROP TYPE "public"."inbound_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "inbound_order_item"`);
        await queryRunner.query(`DROP TABLE "outbound_order_failure"`);
        await queryRunner.query(`DROP TABLE "outbound_order"`);
        await queryRunner.query(`DROP TYPE "public"."outbound_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "outbound_order_item"`);
        await queryRunner.query(`DROP INDEX "public"."one_active_payment_per_order"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6925649a5a4af55fa05ccbf7c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_24e81ae2aaeb9b1549a2a9f641"`);
        await queryRunner.query(`DROP TABLE "stock_movement"`);
        await queryRunner.query(`DROP TABLE "warehouse"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
