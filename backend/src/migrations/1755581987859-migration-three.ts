import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationThree1755581987859 implements MigrationInterface {
    name = 'MigrationThree1755581987859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "signup_control" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total_signups_allowed" integer NOT NULL DEFAULT '100', "total_signups_completed" integer NOT NULL DEFAULT '0', "is_signup_enabled" boolean NOT NULL DEFAULT true, "signup_message" text, "beta_signups_allowed" integer NOT NULL DEFAULT '50', "beta_signups_completed" integer NOT NULL DEFAULT '0', "is_beta_signup_enabled" boolean NOT NULL DEFAULT true, "beta_signup_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated" TIMESTAMP, CONSTRAINT "PK_efc68ae3a4e44c852757ebd7bd0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "signup_control"`);
    }

}
