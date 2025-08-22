import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifyToMVP1755819424711 implements MigrationInterface {
    name = 'SimplifyToMVP1755819424711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_user_trial_dates"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_referral_code"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_session"`);
        await queryRunner.query(`CREATE TYPE "public"."generation_jobs_job_type_enum" AS ENUM('ai-generation', 'email-notification', 'analytics-processing')`);
        await queryRunner.query(`CREATE TYPE "public"."generation_jobs_status_enum" AS ENUM('waiting', 'active', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "generation_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bull_job_id" character varying(100) NOT NULL, "job_type" "public"."generation_jobs_job_type_enum" NOT NULL, "status" "public"."generation_jobs_status_enum" NOT NULL DEFAULT 'waiting', "queue_name" character varying(100) NOT NULL, "user_id" uuid, "generation_id" uuid, "job_data" jsonb NOT NULL, "job_result" jsonb, "processing_metadata" jsonb, "last_error" text, "attempt_count" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '3', "started_at" TIMESTAMP, "completed_at" TIMESTAMP, "processing_time_ms" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8f2ee02696046115dc8d99fe7e5" UNIQUE ("bull_job_id"), CONSTRAINT "PK_6b6b705e0fed45c8440c1d7d637" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_generation_job_created" ON "generation_jobs" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_job_user" ON "generation_jobs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_job_type" ON "generation_jobs" ("job_type") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_job_status" ON "generation_jobs" ("status") `);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "monthly_count"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_api_access"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_team_features"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_white_label"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_custom_integrations"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_beta_user"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_generation_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_paid_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "conversion_source"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "monthly_generation_limit"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "beta_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overage_generations"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overage_charges"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_overage_notification"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overage_warning_sent"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "session_id"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_event_time"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_user_event"`);
        await queryRunner.query(`ALTER TYPE "public"."analytics_events_event_type_enum" RENAME TO "analytics_events_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."analytics_events_event_type_enum" AS ENUM('user_signup', 'user_login', 'user_logout', 'email_verified', 'generation_started', 'generation_completed', 'generation_failed', 'copy_to_clipboard', 'save_to_favorites', 'trial_started', 'upgrade_modal_shown', 'upgrade_initiated', 'upgrade_completed', 'page_view', 'demo_completed', 'pricing_page_viewed')`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ALTER COLUMN "event_type" TYPE "public"."analytics_events_event_type_enum" USING "event_type"::"text"::"public"."analytics_events_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_events_event_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "idx_analytics_event_time" ON "analytics_events" ("event_type", "created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_analytics_user_event" ON "analytics_events" ("user_id", "event_type") `);
        await queryRunner.query(`ALTER TABLE "generation_jobs" ADD CONSTRAINT "FK_8424bd6b7d07ccd149c75fc0bc7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "generation_jobs" ADD CONSTRAINT "FK_a9a66f8839cca5ad8726becd397" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generation_jobs" DROP CONSTRAINT "FK_a9a66f8839cca5ad8726becd397"`);
        await queryRunner.query(`ALTER TABLE "generation_jobs" DROP CONSTRAINT "FK_8424bd6b7d07ccd149c75fc0bc7"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_user_event"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_event_time"`);
        await queryRunner.query(`CREATE TYPE "public"."analytics_events_event_type_enum_old" AS ENUM('user_signup', 'user_login', 'user_logout', 'email_verified', 'generation_started', 'generation_completed', 'generation_failed', 'template_used', 'copy_to_clipboard', 'save_to_favorites', 'share_generation', 'export_generation', 'trial_started', 'upgrade_modal_shown', 'upgrade_initiated', 'upgrade_completed', 'subscription_cancelled', 'team_created', 'team_member_invited', 'team_generation_shared', 'page_view', 'demo_completed', 'pricing_page_viewed')`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ALTER COLUMN "event_type" TYPE "public"."analytics_events_event_type_enum_old" USING "event_type"::"text"::"public"."analytics_events_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_events_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."analytics_events_event_type_enum_old" RENAME TO "analytics_events_event_type_enum"`);
        await queryRunner.query(`CREATE INDEX "idx_analytics_user_event" ON "analytics_events" ("event_type", "user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_analytics_event_time" ON "analytics_events" ("created_at", "event_type") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('user', 'admin', 'super_admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "session_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "overage_warning_sent" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_overage_notification" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "overage_charges" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "overage_generations" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "beta_expires_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "monthly_generation_limit" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "conversion_source" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "first_paid_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "first_generation_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_beta_user" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "has_custom_integrations" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "has_white_label" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "has_team_features" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "has_api_access" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_date" date NOT NULL DEFAULT ('now'::text)::date`);
        await queryRunner.query(`ALTER TABLE "users" ADD "monthly_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_job_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_job_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_job_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_job_created"`);
        await queryRunner.query(`DROP TABLE "generation_jobs"`);
        await queryRunner.query(`DROP TYPE "public"."generation_jobs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."generation_jobs_job_type_enum"`);
        await queryRunner.query(`CREATE INDEX "idx_analytics_session" ON "analytics_events" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "idx_user_referral_code" ON "users" ("referral_code") `);
        await queryRunner.query(`CREATE INDEX "idx_user_trial_dates" ON "users" ("trial_ends_at", "trial_started_at") `);
    }

}
