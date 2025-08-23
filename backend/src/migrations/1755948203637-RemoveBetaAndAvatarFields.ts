import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveBetaAndAvatarFields1755948203637 implements MigrationInterface {
  name = "RemoveBetaAndAvatarFields1755948203637";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_url"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_beta_user"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "beta_expires_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "beta_expires_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "is_beta_user" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar_url" character varying`);
  }
}
