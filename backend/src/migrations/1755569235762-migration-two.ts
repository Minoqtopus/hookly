import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationTwo1755569235762 implements MigrationInterface {
  name = "MigrationTwo1755569235762";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."team_invitations_invited_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
    await queryRunner.query(`CREATE TYPE "public"."team_invitations_status_enum" AS ENUM('pending', 'accepted', 'declined', 'expired')`);
    await queryRunner.query(
      `CREATE TABLE "team_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_id" uuid NOT NULL, "invited_by_user_id" uuid NOT NULL, "invitee_email" character varying(255) NOT NULL, "invited_role" "public"."team_invitations_invited_role_enum" NOT NULL DEFAULT 'member', "status" "public"."team_invitations_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP, "message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c14b443d431077f89344a3fd262" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_team_invitation_status" ON "team_invitations" ("status") `);
    await queryRunner.query(`CREATE INDEX "idx_team_invitation_email" ON "team_invitations" ("invitee_email") `);
    await queryRunner.query(`CREATE INDEX "idx_team_invitation_team" ON "team_invitations" ("team_id") `);
    await queryRunner.query(
      `CREATE TYPE "public"."team_activities_activity_type_enum" AS ENUM('generation_created', 'generation_shared', 'member_added', 'member_removed', 'role_changed', 'generation_favorited')`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_id" uuid NOT NULL, "user_id" uuid NOT NULL, "activity_type" "public"."team_activities_activity_type_enum" NOT NULL DEFAULT 'generation_created', "activity_data" jsonb, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4f6293f69e662681ce6d1da49e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_team_activity_type" ON "team_activities" ("activity_type") `);
    await queryRunner.query(`CREATE INDEX "idx_team_activity_user" ON "team_activities" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "idx_team_activity_team" ON "team_activities" ("team_id") `);
    await queryRunner.query(`ALTER TABLE "users" ADD "beta_expires_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "overage_generations" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "overage_charges" numeric(10,2) NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "last_overage_notification" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "overage_warning_sent" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" ADD "has_tiktok_access" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "users" ADD "has_x_access" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" ADD "has_instagram_access" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" ADD "has_youtube_access" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "teams" ADD "plan_tier" character varying(50) NOT NULL DEFAULT 'starter'`);
    await queryRunner.query(`ALTER TABLE "teams" ADD "current_member_count" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "teams" ADD "has_team_features" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TYPE "public"."users_plan_enum" RENAME TO "users_plan_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."users_plan_enum" AS ENUM('trial', 'starter', 'pro', 'agency')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "plan" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "plan" TYPE "public"."users_plan_enum" USING "plan"::"text"::"public"."users_plan_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "plan" SET DEFAULT 'trial'`);
    await queryRunner.query(`DROP TYPE "public"."users_plan_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "team_invitations" ADD CONSTRAINT "FK_47d9ff0726cf20571e29480a99b" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_invitations" ADD CONSTRAINT "FK_a21dfce459f602ee97c7b074b8e" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_activities" ADD CONSTRAINT "FK_9c88ff29e520fa51fd00f176f48" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_activities" ADD CONSTRAINT "FK_24852ed860a0446a5f1e5ca8204" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team_activities" DROP CONSTRAINT "FK_24852ed860a0446a5f1e5ca8204"`);
    await queryRunner.query(`ALTER TABLE "team_activities" DROP CONSTRAINT "FK_9c88ff29e520fa51fd00f176f48"`);
    await queryRunner.query(`ALTER TABLE "team_invitations" DROP CONSTRAINT "FK_a21dfce459f602ee97c7b074b8e"`);
    await queryRunner.query(`ALTER TABLE "team_invitations" DROP CONSTRAINT "FK_47d9ff0726cf20571e29480a99b"`);
    await queryRunner.query(`CREATE TYPE "public"."users_plan_enum_old" AS ENUM('trial', 'creator', 'agency')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "plan" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "plan" TYPE "public"."users_plan_enum_old" USING "plan"::"text"::"public"."users_plan_enum_old"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "plan" SET DEFAULT 'trial'`);
    await queryRunner.query(`DROP TYPE "public"."users_plan_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."users_plan_enum_old" RENAME TO "users_plan_enum"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "has_team_features"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "current_member_count"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "plan_tier"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_youtube_access"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_instagram_access"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_x_access"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_tiktok_access"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overage_warning_sent"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_overage_notification"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overage_charges"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overage_generations"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "beta_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_activity_team"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_activity_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_activity_type"`);
    await queryRunner.query(`DROP TABLE "team_activities"`);
    await queryRunner.query(`DROP TYPE "public"."team_activities_activity_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_invitation_team"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_invitation_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_invitation_status"`);
    await queryRunner.query(`DROP TABLE "team_invitations"`);
    await queryRunner.query(`DROP TYPE "public"."team_invitations_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."team_invitations_invited_role_enum"`);
  }
}
