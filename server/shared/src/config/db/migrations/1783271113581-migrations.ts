import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783271113581 implements MigrationInterface {
    name = 'Migrations1783271113581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inbound_order_failure" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "item_id" uuid, "reason" character varying NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "resolved" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4453870ddce294e2f5d2ab80b2c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "inbound_order_failure"`);
    }

}
