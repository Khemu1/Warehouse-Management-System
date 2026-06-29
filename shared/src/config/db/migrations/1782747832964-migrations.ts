import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1782747832964 implements MigrationInterface {
    name = 'Migrations1782747832964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "organizer_id" uuid`);
        await queryRunner.query(`ALTER TABLE "events" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD "date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD "location" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD "total_seats" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD "available_seats" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD "price" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "available_seats"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "total_seats"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organizer_id"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "user_id" uuid`);
    }

}
