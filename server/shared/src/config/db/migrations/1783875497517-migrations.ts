import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783875497517 implements MigrationInterface {
    name = 'Migrations1783875497517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbound_order" RENAME COLUMN "items_total" TO "total_products"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbound_order" RENAME COLUMN "total_products" TO "items_total"`);
    }

}
