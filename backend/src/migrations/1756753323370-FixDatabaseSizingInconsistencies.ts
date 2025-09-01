import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDatabaseSizingInconsistencies1756753323370 implements MigrationInterface {
    name = 'FixDatabaseSizingInconsistencies1756753323370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revoked_reason"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "revoked_reason" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "page_url"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "page_url" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "referrer"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "referrer" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "user_agent"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "user_agent" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP COLUMN "user_agent"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD "user_agent" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP COLUMN "user_agent"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD "user_agent" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "user_agent"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "user_agent" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "referrer"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "referrer" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "page_url"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "page_url" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revoked_reason"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "revoked_reason" character varying(100)`);
    }

}
