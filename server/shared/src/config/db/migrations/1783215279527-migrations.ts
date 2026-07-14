import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783215279527 implements MigrationInterface {
    name = 'Migrations1783215279527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inbound_order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inbound_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "expected_quantity" integer NOT NULL, "received_quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5ba8a49ec23c90a7a16313171f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inbound_order_status_enum" AS ENUM('pending', 'received', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "inbound_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "warehouse_id" uuid NOT NULL, "supplier_name" character varying NOT NULL, "status" "public"."inbound_order_status_enum" NOT NULL DEFAULT 'pending', "total_amount" integer NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee61b2a979421005c2dbb25c821" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inbound_order_item" ADD CONSTRAINT "FK_b7be6a130d2ae253a4766f5d032" FOREIGN KEY ("inbound_order_id") REFERENCES "inbound_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inbound_order_item" DROP CONSTRAINT "FK_b7be6a130d2ae253a4766f5d032"`);
        await queryRunner.query(`DROP TABLE "inbound_order"`);
        await queryRunner.query(`DROP TYPE "public"."inbound_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "inbound_order_item"`);
    }

}
