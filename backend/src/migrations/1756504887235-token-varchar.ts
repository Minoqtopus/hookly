import { MigrationInterface, QueryRunner } from "typeorm";

export class TokenVarchar1756504887235 implements MigrationInterface {
    name = 'TokenVarchar1756504887235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_verification_token"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD "token" character varying(225) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24" UNIQUE ("token")`);
        await queryRunner.query(`CREATE INDEX "idx_verification_token" ON "email_verifications" ("token") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_verification_token"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD "token" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24" UNIQUE ("token")`);
        await queryRunner.query(`CREATE INDEX "idx_verification_token" ON "email_verifications" ("token") `);
    }

}
