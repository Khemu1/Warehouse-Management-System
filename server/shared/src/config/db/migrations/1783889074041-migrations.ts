import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783889074041 implements MigrationInterface {
    name = 'Migrations1783889074041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbound_order" ADD "confirmed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbound_order" DROP COLUMN "confirmed_at"`);
    }

}
