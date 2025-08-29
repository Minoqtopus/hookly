import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationOne1756462127622 implements MigrationInterface {
  name = "MigrationOne1756462127622";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying(64) NOT NULL, "token_family" uuid NOT NULL, "expires_at" TIMESTAMP NOT NULL, "ip_address" character varying(45), "user_agent" character varying(500), "is_revoked" boolean NOT NULL DEFAULT false, "revoked_at" TIMESTAMP, "revoked_reason" character varying(100), "last_used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("token_hash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_refresh_token_family" ON "refresh_tokens" ("token_family") `);
    await queryRunner.query(`CREATE INDEX "idx_refresh_token_expires" ON "refresh_tokens" ("expires_at") `);
    await queryRunner.query(`CREATE INDEX "idx_refresh_token_user" ON "refresh_tokens" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "idx_refresh_token_hash" ON "refresh_tokens" ("token_hash") `);
    await queryRunner.query(`CREATE TYPE "generations_platform_enum" AS ENUM('instagram', 'tiktok', 'youtube')`);
    await queryRunner.query(`CREATE TYPE "generations_status_enum" AS ENUM('pending', 'completed', 'failed')`);
    await queryRunner.query(
      `CREATE TABLE "generations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(500) NOT NULL, "hook" text NOT NULL, "script" text NOT NULL, "platform" "generations_platform_enum" NOT NULL DEFAULT 'tiktok', "status" "generations_status_enum" NOT NULL DEFAULT 'pending', "niche" character varying(100), "target_audience" character varying(200), "performance_data" jsonb, "is_favorite" boolean NOT NULL DEFAULT false, "is_demo" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_9d2a52fbde1fba42c24ec42ddd2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_generation_created" ON "generations" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_status" ON "generations" ("status") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_user" ON "generations" ("userId") `);
    await queryRunner.query(`CREATE TYPE "users_plan_enum" AS ENUM('trial', 'starter', 'pro')`);
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('user', 'admin')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "first_name" character varying, "last_name" character varying, "profile_picture" character varying, "plan" "users_plan_enum" NOT NULL DEFAULT 'trial', "role" "users_role_enum" NOT NULL DEFAULT 'user', "auth_providers" text NOT NULL DEFAULT '["email"]', "provider_ids" jsonb, "monthly_generation_count" integer NOT NULL DEFAULT '0', "monthly_reset_date" date, "trial_started_at" TIMESTAMP, "trial_ends_at" TIMESTAMP, "trial_generations_used" integer NOT NULL DEFAULT '0', "is_email_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP, "password_changed_at" TIMESTAMP, "total_generations" integer NOT NULL DEFAULT '0', "has_tiktok_access" boolean NOT NULL DEFAULT true, "has_youtube_access" boolean NOT NULL DEFAULT false, "has_instagram_access" boolean NOT NULL DEFAULT false, "registration_ip" character varying(45), "registration_user_agent" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_user_provider_ids" ON "users" ("provider_ids") `);
    await queryRunner.query(`CREATE INDEX "idx_user_plan" ON "users" ("plan") `);
    await queryRunner.query(`CREATE INDEX "idx_user_email" ON "users" ("email") `);
    await queryRunner.query(
      `CREATE TYPE "analytics_events_event_type_enum" AS ENUM('registration', 'login', 'logout', 'email_verified', 'generation_started', 'generation_completed', 'generation_failed', 'copy_to_clipboard', 'save_to_favorites', 'trial_started', 'upgrade_modal_shown', 'upgrade_initiated', 'upgrade_completed', 'page_view', 'demo_completed', 'pricing_page_viewed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "event_type" "analytics_events_event_type_enum" NOT NULL, "page_url" character varying(200), "referrer" character varying(200), "user_agent" character varying(100), "ip_address" character varying(45), "event_data" jsonb, "user_context" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_analytics_event_time" ON "analytics_events" ("event_type", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_analytics_user_event" ON "analytics_events" ("user_id", "event_type") `);
    await queryRunner.query(`CREATE TYPE "email_verifications_type_enum" AS ENUM('email_verification', 'email_change', 'password_reset')`);
    await queryRunner.query(`CREATE TYPE "email_verifications_status_enum" AS ENUM('pending', 'verified', 'expired', 'failed', 'resent')`);
    await queryRunner.query(
      `CREATE TABLE "email_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "email" character varying(255) NOT NULL, "token" character varying(100) NOT NULL, "type" "email_verifications_type_enum" NOT NULL DEFAULT 'email_verification', "status" "email_verifications_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "verified_at" TIMESTAMP, "ip_address" character varying(45), "user_agent" character varying(200), "attempt_count" integer NOT NULL DEFAULT '0', "last_attempt_at" TIMESTAMP, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24" UNIQUE ("token"), CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_verification_user_type" ON "email_verifications" ("user_id", "type") `);
    await queryRunner.query(`CREATE INDEX "idx_verification_email" ON "email_verifications" ("email") `);
    await queryRunner.query(`CREATE INDEX "idx_verification_token" ON "email_verifications" ("token") `);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "generations" ADD CONSTRAINT "FK_c2a1ec14c609ee042edbbbc0a81" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verifications" ADD CONSTRAINT "FK_c4f1838323ae1dff5aa00148915" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_c4f1838323ae1dff5aa00148915"`);
    await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e"`);
    await queryRunner.query(`ALTER TABLE "generations" DROP CONSTRAINT "FK_c2a1ec14c609ee042edbbbc0a81"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
    await queryRunner.query(`DROP INDEX "idx_verification_token"`);
    await queryRunner.query(`DROP INDEX "idx_verification_email"`);
    await queryRunner.query(`DROP INDEX "idx_verification_user_type"`);
    await queryRunner.query(`DROP TABLE "email_verifications"`);
    await queryRunner.query(`DROP TYPE "email_verifications_status_enum"`);
    await queryRunner.query(`DROP TYPE "email_verifications_type_enum"`);
    await queryRunner.query(`DROP INDEX "idx_analytics_user_event"`);
    await queryRunner.query(`DROP INDEX "idx_analytics_event_time"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TYPE "analytics_events_event_type_enum"`);
    await queryRunner.query(`DROP INDEX "idx_user_email"`);
    await queryRunner.query(`DROP INDEX "idx_user_plan"`);
    await queryRunner.query(`DROP INDEX "idx_user_provider_ids"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
    await queryRunner.query(`DROP TYPE "users_plan_enum"`);
    await queryRunner.query(`DROP INDEX "idx_generation_user"`);
    await queryRunner.query(`DROP INDEX "idx_generation_status"`);
    await queryRunner.query(`DROP INDEX "idx_generation_created"`);
    await queryRunner.query(`DROP TABLE "generations"`);
    await queryRunner.query(`DROP TYPE "generations_status_enum"`);
    await queryRunner.query(`DROP TYPE "generations_platform_enum"`);
    await queryRunner.query(`DROP INDEX "idx_refresh_token_hash"`);
    await queryRunner.query(`DROP INDEX "idx_refresh_token_user"`);
    await queryRunner.query(`DROP INDEX "idx_refresh_token_expires"`);
    await queryRunner.query(`DROP INDEX "idx_refresh_token_family"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
