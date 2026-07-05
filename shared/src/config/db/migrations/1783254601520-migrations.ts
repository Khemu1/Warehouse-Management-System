import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783254601520 implements MigrationInterface {
    name = 'Migrations1783254601520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inbound_order_item" ALTER COLUMN "received_quantity" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inbound_order_item" ALTER COLUMN "received_quantity" DROP DEFAULT`);
    }

}
