import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1755537958303 implements MigrationInterface {
  name = "InitialMigration1755537958303";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "generations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "title" character varying, "product_name" character varying NOT NULL, "niche" character varying NOT NULL, "target_audience" character varying NOT NULL, "hook" text NOT NULL, "script" text NOT NULL, "visuals" text NOT NULL, "is_favorite" boolean NOT NULL DEFAULT false, "is_featured" boolean NOT NULL DEFAULT false, "is_guest_generation" boolean NOT NULL DEFAULT false, "performance_data" jsonb, "generation_metadata" jsonb, "share_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d2a52fbde1fba42c24ec42ddd2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_generation_favorite_user" ON "generations" ("user_id", "is_favorite") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_guest" ON "generations" ("is_guest_generation", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_featured" ON "generations" ("is_featured") `);
    await queryRunner.query(`CREATE INDEX "idx_generation_user_created" ON "generations" ("user_id", "created_at") `);
    await queryRunner.query(`CREATE TYPE "public"."users_plan_enum" AS ENUM('trial', 'creator', 'agency')`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin', 'super_admin')`);
    await queryRunner.query(`CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('email', 'google')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "plan" "public"."users_plan_enum" NOT NULL DEFAULT 'trial', "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "monthly_count" integer NOT NULL DEFAULT '0', "reset_date" date NOT NULL DEFAULT ('now'::text)::date, "monthly_generation_count" integer NOT NULL DEFAULT '0', "monthly_reset_date" date NOT NULL DEFAULT ('now'::text)::date, "trial_started_at" TIMESTAMP, "trial_ends_at" TIMESTAMP, "trial_generations_used" integer NOT NULL DEFAULT '0', "google_id" character varying, "auth_provider" "public"."users_auth_provider_enum" NOT NULL DEFAULT 'email', "avatar_url" character varying, "is_verified" boolean NOT NULL DEFAULT false, "referral_code" character varying, "total_generations" integer NOT NULL DEFAULT '0', "referral_count" integer NOT NULL DEFAULT '0', "has_batch_generation" boolean NOT NULL DEFAULT false, "has_advanced_analytics" boolean NOT NULL DEFAULT false, "has_api_access" boolean NOT NULL DEFAULT false, "has_team_features" boolean NOT NULL DEFAULT false, "has_white_label" boolean NOT NULL DEFAULT false, "has_custom_integrations" boolean NOT NULL DEFAULT false, "is_beta_user" boolean NOT NULL DEFAULT false, "first_generation_at" TIMESTAMP, "first_paid_at" TIMESTAMP, "conversion_source" character varying(100), "monthly_generation_limit" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_ba10055f9ef9690e77cf6445cba" UNIQUE ("referral_code"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_user_trial_dates" ON "users" ("trial_started_at", "trial_ends_at") `);
    await queryRunner.query(`CREATE INDEX "idx_user_referral_code" ON "users" ("referral_code") `);
    await queryRunner.query(`CREATE INDEX "idx_user_google_id" ON "users" ("google_id") `);
    await queryRunner.query(`CREATE INDEX "idx_user_plan" ON "users" ("plan") `);
    await queryRunner.query(`CREATE INDEX "idx_user_email" ON "users" ("email") `);
    await queryRunner.query(
      `CREATE TYPE "public"."analytics_events_event_type_enum" AS ENUM('user_signup', 'user_login', 'user_logout', 'email_verified', 'generation_started', 'generation_completed', 'generation_failed', 'template_used', 'copy_to_clipboard', 'save_to_favorites', 'share_generation', 'export_generation', 'trial_started', 'upgrade_modal_shown', 'upgrade_initiated', 'upgrade_completed', 'subscription_cancelled', 'team_created', 'team_member_invited', 'team_generation_shared', 'page_view', 'demo_completed', 'pricing_page_viewed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "event_type" "public"."analytics_events_event_type_enum" NOT NULL, "session_id" character varying(100), "page_url" character varying(200), "referrer" character varying(200), "user_agent" character varying(100), "ip_address" character varying(45), "event_data" jsonb, "user_context" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_analytics_session" ON "analytics_events" ("session_id") `);
    await queryRunner.query(`CREATE INDEX "idx_analytics_event_time" ON "analytics_events" ("event_type", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_analytics_user_event" ON "analytics_events" ("user_id", "event_type") `);
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "owner_id" uuid NOT NULL, "member_limit" integer NOT NULL DEFAULT '5', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_team_active" ON "teams" ("is_active") `);
    await queryRunner.query(`CREATE INDEX "idx_team_owner" ON "teams" ("owner_id") `);
    await queryRunner.query(`CREATE TYPE "public"."team_members_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
    await queryRunner.query(
      `CREATE TABLE "team_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" "public"."team_members_role_enum" NOT NULL DEFAULT 'member', "is_active" boolean NOT NULL DEFAULT true, "invited_at" TIMESTAMP, "joined_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_team_member_active" ON "team_members" ("team_id", "is_active") `);
    await queryRunner.query(`CREATE INDEX "idx_team_member_user" ON "team_members" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "idx_team_member_team_user" ON "team_members" ("team_id", "user_id") `);
    await queryRunner.query(
      `CREATE TABLE "shared_generations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "generation_id" uuid NOT NULL, "team_id" uuid NOT NULL, "shared_by_user_id" uuid NOT NULL, "title" character varying(200), "notes" text, "ad_data" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3ca0f7e0e079af5143e5c378b75" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_shared_generation_created" ON "shared_generations" ("team_id", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_shared_generation_user" ON "shared_generations" ("shared_by_user_id") `);
    await queryRunner.query(`CREATE INDEX "idx_shared_generation_team" ON "shared_generations" ("team_id", "is_active") `);
    await queryRunner.query(`CREATE TYPE "public"."api_keys_status_enum" AS ENUM('active', 'inactive', 'revoked')`);
    await queryRunner.query(
      `CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "key_hash" character varying(100) NOT NULL, "key_prefix" character varying(20) NOT NULL, "user_id" uuid NOT NULL, "team_id" uuid, "status" "public"."api_keys_status_enum" NOT NULL DEFAULT 'active', "scopes" text NOT NULL, "expires_at" TIMESTAMP, "last_used_at" TIMESTAMP, "last_used_ip" character varying(45), "usage_count" integer NOT NULL DEFAULT '0', "rate_limit_per_hour" integer, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_57384430aa1959f4578046c9b81" UNIQUE ("key_hash"), CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_api_key_team" ON "api_keys" ("team_id", "status") `);
    await queryRunner.query(`CREATE INDEX "idx_api_key_user" ON "api_keys" ("user_id", "status") `);
    await queryRunner.query(`CREATE INDEX "idx_api_key_hash" ON "api_keys" ("key_hash") `);
    await queryRunner.query(`CREATE TYPE "public"."email_verifications_type_enum" AS ENUM('email_signup', 'email_change', 'password_reset')`);
    await queryRunner.query(`CREATE TYPE "public"."email_verifications_status_enum" AS ENUM('pending', 'verified', 'expired', 'resent')`);
    await queryRunner.query(
      `CREATE TABLE "email_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "email" character varying(255) NOT NULL, "token" character varying(100) NOT NULL, "type" "public"."email_verifications_type_enum" NOT NULL DEFAULT 'email_signup', "status" "public"."email_verifications_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "verified_at" TIMESTAMP, "ip_address" character varying(45), "user_agent" character varying(200), "attempt_count" integer NOT NULL DEFAULT '0', "last_attempt_at" TIMESTAMP, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24" UNIQUE ("token"), CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_verification_user_type" ON "email_verifications" ("user_id", "type") `);
    await queryRunner.query(`CREATE INDEX "idx_verification_email" ON "email_verifications" ("email") `);
    await queryRunner.query(`CREATE INDEX "idx_verification_token" ON "email_verifications" ("token") `);
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_events_event_type_enum" AS ENUM('subscription_created', 'subscription_updated', 'subscription_cancelled', 'subscription_resumed', 'subscription_expired', 'subscription_paused', 'subscription_payment_success', 'subscription_payment_failed', 'subscription_payment_recovered', 'subscription_payment_refunded', 'subscription_plan_changed', 'subscription_plan_changed_proration', 'trial_started', 'trial_ending_soon', 'trial_ended', 'trial_converted', 'license_key_created', 'license_key_updated')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_events_subscription_status_enum" AS ENUM('active', 'cancelled', 'expired', 'past_due', 'paused', 'unpaid', 'on_trial')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "event_type" "public"."subscription_events_event_type_enum" NOT NULL, "lemonsqueezy_subscription_id" character varying(100), "lemonsqueezy_customer_id" character varying(100), "lemonsqueezy_order_id" character varying(100), "subscription_status" "public"."subscription_events_subscription_status_enum", "plan_name" character varying(50), "previous_plan_name" character varying(50), "amount" numeric(10,2), "currency" character varying(3), "billing_period_start" TIMESTAMP, "billing_period_end" TIMESTAMP, "trial_ends_at" TIMESTAMP, "webhook_data" jsonb, "subscription_data" jsonb, "is_processed" boolean NOT NULL DEFAULT false, "processed_at" TIMESTAMP, "processing_notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7eb5647aa3071cffad0124bceee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_subscription_event_type_date" ON "subscription_events" ("event_type", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_subscription_event_lemonsqueezy" ON "subscription_events" ("lemonsqueezy_subscription_id", "created_at") `);
    await queryRunner.query(`CREATE INDEX "idx_subscription_event_user" ON "subscription_events" ("user_id", "event_type") `);
    await queryRunner.query(
      `CREATE TYPE "public"."templates_category_enum" AS ENUM('beauty', 'fitness', 'tech', 'food', 'fashion', 'education', 'lifestyle', 'business')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."templates_status_enum" AS ENUM('active', 'inactive', 'draft')`);
    await queryRunner.query(
      `CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "category" "public"."templates_category_enum" NOT NULL, "target_audience" character varying(200) NOT NULL, "hook" text NOT NULL, "script" text NOT NULL, "visuals" jsonb NOT NULL, "performance_metrics" jsonb NOT NULL, "tags" text, "is_popular" boolean NOT NULL DEFAULT false, "is_featured" boolean NOT NULL DEFAULT true, "status" "public"."templates_status_enum" NOT NULL DEFAULT 'active', "performance_score" numeric(3,2) NOT NULL DEFAULT '0', "usage_count" integer NOT NULL DEFAULT '0', "conversion_count" integer NOT NULL DEFAULT '0', "description" text, "created_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_template_popularity" ON "templates" ("is_popular", "performance_score") `);
    await queryRunner.query(`CREATE INDEX "idx_template_category_status" ON "templates" ("category", "status") `);
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "email_notifications" boolean NOT NULL DEFAULT true, "marketing_emails" boolean NOT NULL DEFAULT true, "product_updates" boolean NOT NULL DEFAULT true, "usage_alerts" boolean NOT NULL DEFAULT false, "trial_reminders" boolean NOT NULL DEFAULT true, "allow_analytics_tracking" boolean NOT NULL DEFAULT false, "share_usage_data" boolean NOT NULL DEFAULT false, "allow_performance_improvements" boolean NOT NULL DEFAULT true, "preferred_currency" character varying(10) NOT NULL DEFAULT 'USD', "billing_name" character varying(100), "billing_address" character varying(200), "billing_city" character varying(100), "billing_country" character varying(50), "billing_postal_code" character varying(20), "tax_id" character varying(100), "generation_style" character varying(50) NOT NULL DEFAULT 'balanced', "preferred_tone" character varying(50) NOT NULL DEFAULT 'auto', "auto_save_generations" boolean NOT NULL DEFAULT true, "script_length_preference" integer NOT NULL DEFAULT '30', "lemonsqueezy_customer_id" character varying(100), "lemonsqueezy_subscription_id" character varying(100), "subscription_metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302" UNIQUE ("user_id"), CONSTRAINT "REL_4ed056b9344e6f7d8d46ec4b30" UNIQUE ("user_id"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "generations" ADD CONSTRAINT "FK_d2144f7590e23819132d9222968" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_03655bd3d01df69022646faffd5" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_generations" ADD CONSTRAINT "FK_bb5650b07d0bf9d3aaddddf6f45" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_generations" ADD CONSTRAINT "FK_93f028146e8e424a1e6c50ca3de" FOREIGN KEY ("shared_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_a3baee01d8408cd3c0f89a9a973" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_dab6f38770515f36935b6f53963" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verifications" ADD CONSTRAINT "FK_c4f1838323ae1dff5aa00148915" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_events" ADD CONSTRAINT "FK_e55c3e7023c80ebd5d1f6f36e5b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`);
    await queryRunner.query(`ALTER TABLE "subscription_events" DROP CONSTRAINT "FK_e55c3e7023c80ebd5d1f6f36e5b"`);
    await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_c4f1838323ae1dff5aa00148915"`);
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_dab6f38770515f36935b6f53963"`);
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_a3baee01d8408cd3c0f89a9a973"`);
    await queryRunner.query(`ALTER TABLE "shared_generations" DROP CONSTRAINT "FK_93f028146e8e424a1e6c50ca3de"`);
    await queryRunner.query(`ALTER TABLE "shared_generations" DROP CONSTRAINT "FK_bb5650b07d0bf9d3aaddddf6f45"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_03655bd3d01df69022646faffd5"`);
    await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e"`);
    await queryRunner.query(`ALTER TABLE "generations" DROP CONSTRAINT "FK_d2144f7590e23819132d9222968"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP INDEX "public"."idx_template_category_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_template_popularity"`);
    await queryRunner.query(`DROP TABLE "templates"`);
    await queryRunner.query(`DROP TYPE "public"."templates_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."templates_category_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscription_event_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscription_event_lemonsqueezy"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscription_event_type_date"`);
    await queryRunner.query(`DROP TABLE "subscription_events"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_events_subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_events_event_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_verification_token"`);
    await queryRunner.query(`DROP INDEX "public"."idx_verification_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_verification_user_type"`);
    await queryRunner.query(`DROP TABLE "email_verifications"`);
    await queryRunner.query(`DROP TYPE "public"."email_verifications_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."email_verifications_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_api_key_hash"`);
    await queryRunner.query(`DROP INDEX "public"."idx_api_key_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_api_key_team"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TYPE "public"."api_keys_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shared_generation_team"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shared_generation_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shared_generation_created"`);
    await queryRunner.query(`DROP TABLE "shared_generations"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_member_team_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_member_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_member_active"`);
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TYPE "public"."team_members_role_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_owner"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_active"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP INDEX "public"."idx_analytics_user_event"`);
    await queryRunner.query(`DROP INDEX "public"."idx_analytics_event_time"`);
    await queryRunner.query(`DROP INDEX "public"."idx_analytics_session"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TYPE "public"."analytics_events_event_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_plan"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_google_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_referral_code"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_trial_dates"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_auth_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_plan_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_user_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_featured"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_guest"`);
    await queryRunner.query(`DROP INDEX "public"."idx_generation_favorite_user"`);
    await queryRunner.query(`DROP TABLE "generations"`);
  }
}
