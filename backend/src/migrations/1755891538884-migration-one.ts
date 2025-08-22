import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationOne1755891538884 implements MigrationInterface {
  name = "MigrationOne1755891538884";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "generations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "title" character varying, "product_name" character varying NOT NULL, "niche" character varying NOT NULL, "target_audience" character varying NOT NULL, "hook" text NOT NULL, "script" text NOT NULL, "visuals" text NOT NULL, "is_favorite" boolean NOT NULL DEFAULT false, "is_featured" boolean NOT NULL DEFAULT false, "is_guest_generation" boolean NOT NULL DEFAULT false, "guest_ip_address" character varying, "performance_data" jsonb, "generation_metadata" jsonb, "share_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d2a52fbde1fba42c24ec42ddd2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_generation_favorite_user" ON "generations" ("user_id", "is_favorite") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_guest_ip" ON "generations" ("guest_ip_address", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_guest" ON "generations" ("is_guest_generation", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_featured" ON "generations" ("is_featured") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_user_created" ON "generations" ("user_id", "created_at") `);
    await queryRunner.query(`CREATE TYPE "public"."users_plan_enum" AS ENUM('trial', 'starter', 'pro')`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "plan" "public"."users_plan_enum" NOT NULL DEFAULT 'trial', "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "monthly_generation_count" integer NOT NULL DEFAULT '0', "monthly_reset_date" date, "trial_started_at" TIMESTAMP NOT NULL, "trial_ends_at" TIMESTAMP NOT NULL, "trial_generations_used" integer NOT NULL DEFAULT '0', "google_id" character varying, "auth_providers" text NOT NULL DEFAULT '["email"]', "avatar_url" character varying, "is_verified" boolean NOT NULL DEFAULT false, "total_generations" integer NOT NULL DEFAULT '0', "has_tiktok_access" boolean NOT NULL DEFAULT true, "has_x_access" boolean NOT NULL DEFAULT false, "has_instagram_access" boolean NOT NULL DEFAULT false, "is_beta_user" boolean NOT NULL DEFAULT false, "beta_expires_at" TIMESTAMP, "registration_ip" character varying(45), "registration_user_agent" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_user_google_id" ON "users" ("google_id") `);
    await queryRunner.query(`CREATE INDEX "idx_user_plan" ON "users" ("plan") `);
    await queryRunner.query(`CREATE INDEX "idx_user_email" ON "users" ("email") `);
    await queryRunner.query(
      `CREATE TYPE "public"."analytics_events_event_type_enum" AS ENUM('user_signup', 'user_login', 'user_logout', 'email_verified', 'generation_started', 'generation_completed', 'generation_failed', 'copy_to_clipboard', 'save_to_favorites', 'trial_started', 'upgrade_modal_shown', 'upgrade_initiated', 'upgrade_completed', 'page_view', 'demo_completed', 'pricing_page_viewed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "event_type" "public"."analytics_events_event_type_enum" NOT NULL, "page_url" character varying(200), "referrer" character varying(200), "user_agent" character varying(100), "ip_address" character varying(45), "event_data" jsonb, "user_context" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_analytics_event_time" ON "analytics_events" ("event_type", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_analytics_user_event" ON "analytics_events" ("user_id", "event_type") `);
    await queryRunner.query(`CREATE TYPE "public"."email_verifications_type_enum" AS ENUM('email_signup', 'email_change', 'password_reset')`);
    await queryRunner.query(`CREATE TYPE "public"."email_verifications_status_enum" AS ENUM('pending', 'verified', 'expired', 'resent')`);
    await queryRunner.query(
      `CREATE TABLE "email_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "email" character varying(255) NOT NULL, "token" character varying(100) NOT NULL, "type" "public"."email_verifications_type_enum" NOT NULL DEFAULT 'email_signup', "status" "public"."email_verifications_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "verified_at" TIMESTAMP, "ip_address" character varying(45), "user_agent" character varying(200), "attempt_count" integer NOT NULL DEFAULT '0', "last_attempt_at" TIMESTAMP, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24" UNIQUE ("token"), CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_verification_user_type" ON "email_verifications" ("user_id", "type") `);
    await queryRunner.query(`CREATE INDEX "idx_verification_email" ON "email_verifications" ("email") `);
    await queryRunner.query(`CREATE INDEX "idx_verification_token" ON "email_verifications" ("token") `);
    await queryRunner.query(`CREATE TYPE "public"."generation_jobs_job_type_enum" AS ENUM('ai-generation', 'email-notification', 'analytics-processing')`);
    await queryRunner.query(`CREATE TYPE "public"."generation_jobs_status_enum" AS ENUM('waiting', 'active', 'completed', 'failed')`);
    await queryRunner.query(
      `CREATE TABLE "generation_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bull_job_id" character varying(100) NOT NULL, "job_type" "public"."generation_jobs_job_type_enum" NOT NULL, "status" "public"."generation_jobs_status_enum" NOT NULL DEFAULT 'waiting', "queue_name" character varying(100) NOT NULL, "user_id" uuid, "generation_id" uuid, "job_data" jsonb NOT NULL, "job_result" jsonb, "processing_metadata" jsonb, "last_error" text, "attempt_count" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '3', "started_at" TIMESTAMP, "completed_at" TIMESTAMP, "processing_time_ms" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8f2ee02696046115dc8d99fe7e5" UNIQUE ("bull_job_id"), CONSTRAINT "PK_6b6b705e0fed45c8440c1d7d637" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_generation_job_created" ON "generation_jobs" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_job_user" ON "generation_jobs" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_job_type" ON "generation_jobs" ("job_type") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_job_status" ON "generation_jobs" ("status") `);
    await queryRunner.query(
      `CREATE TABLE "signup_control" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total_signups_allowed" integer NOT NULL DEFAULT '100', "total_signups_completed" integer NOT NULL DEFAULT '0', "is_signup_enabled" boolean NOT NULL DEFAULT true, "signup_message" text, "beta_signups_allowed" integer NOT NULL DEFAULT '50', "beta_signups_completed" integer NOT NULL DEFAULT '0', "is_beta_signup_enabled" boolean NOT NULL DEFAULT true, "beta_signup_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated" TIMESTAMP, CONSTRAINT "CHK_db71397246e79e6c37439a4982" CHECK ("beta_signups_allowed" >= 0), CONSTRAINT "CHK_d19bbd9aee0cff3aa0e91b401f" CHECK ("total_signups_allowed" >= 0), CONSTRAINT "CHK_f62946456ace1549e9bf23a1a2" CHECK ("beta_signups_completed" >= 0), CONSTRAINT "CHK_2caee6f4a732b9670b59b6edc0" CHECK ("total_signups_completed" >= 0), CONSTRAINT "CHK_22cffcbf601a51ee31759dd5bf" CHECK ("beta_signups_completed" <= "beta_signups_allowed"), CONSTRAINT "CHK_d3ecfc0f6b8ecfaa9842301968" CHECK ("total_signups_completed" <= "total_signups_allowed"), CONSTRAINT "PK_efc68ae3a4e44c852757ebd7bd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "generations" ADD CONSTRAINT "FK_d2144f7590e23819132d9222968" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verifications" ADD CONSTRAINT "FK_c4f1838323ae1dff5aa00148915" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "generation_jobs" ADD CONSTRAINT "FK_8424bd6b7d07ccd149c75fc0bc7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "generation_jobs" ADD CONSTRAINT "FK_a9a66f8839cca5ad8726becd397" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "generation_jobs" DROP CONSTRAINT "FK_a9a66f8839cca5ad8726becd397"`);
    await queryRunner.query(`ALTER TABLE "generation_jobs" DROP CONSTRAINT "FK_8424bd6b7d07ccd149c75fc0bc7"`);
    await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_c4f1838323ae1dff5aa00148915"`);
    await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e"`);
    await queryRunner.query(`ALTER TABLE "generations" DROP CONSTRAINT "FK_d2144f7590e23819132d9222968"`);
    await queryRunner.query(`DROP TABLE "signup_control"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_job_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_job_type"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_job_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_job_created"`);
    await queryRunner.query(`DROP TABLE "generation_jobs"`);
    await queryRunner.query(`DROP TYPE "public"."generation_jobs_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."generation_jobs_job_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_verification_token"`);
    await queryRunner.query(`DROP INDEX "public"."idx_verification_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_verification_user_type"`);
    await queryRunner.query(`DROP TABLE "email_verifications"`);
    await queryRunner.query(`DROP TYPE "public"."email_verifications_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."email_verifications_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_analytics_user_event"`);
    await queryRunner.query(`DROP INDEX "public"."idx_analytics_event_time"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TYPE "public"."analytics_events_event_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_plan"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_google_id"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_plan_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_user_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_featured"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_guest"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_guest_ip"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_favorite_user"`);
    await queryRunner.query(`DROP TABLE "generations"`);
  }
}
