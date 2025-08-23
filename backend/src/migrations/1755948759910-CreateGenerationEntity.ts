import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGenerationEntity1755948759910 implements MigrationInterface {
    name = 'CreateGenerationEntity1755948759910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generations" DROP CONSTRAINT "FK_d2144f7590e23819132d9222968"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_favorite_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_guest_ip"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_guest"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_featured"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_user_created"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "product_name"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "visuals"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "is_featured"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "is_guest_generation"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "guest_ip_address"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "generation_metadata"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "share_count"`);
        await queryRunner.query(`CREATE TYPE "public"."generations_platform_enum" AS ENUM('facebook', 'instagram', 'tiktok', 'twitter', 'linkedin')`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "platform" "public"."generations_platform_enum" NOT NULL DEFAULT 'facebook'`);
        await queryRunner.query(`CREATE TYPE "public"."generations_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "status" "public"."generations_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "is_demo" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "title" character varying(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "niche"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "niche" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "target_audience"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "target_audience" character varying(200)`);
        await queryRunner.query(`CREATE INDEX "idx_generation_created" ON "generations" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_status" ON "generations" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_user" ON "generations" ("userId") `);
        await queryRunner.query(`ALTER TABLE "generations" ADD CONSTRAINT "FK_c2a1ec14c609ee042edbbbc0a81" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generations" DROP CONSTRAINT "FK_c2a1ec14c609ee042edbbbc0a81"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_generation_created"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "target_audience"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "target_audience" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "niche"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "niche" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "is_demo"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."generations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "platform"`);
        await queryRunner.query(`DROP TYPE "public"."generations_platform_enum"`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "share_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "generation_metadata" jsonb`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "guest_ip_address" character varying`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "is_guest_generation" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "is_featured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "visuals" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "product_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "generations" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE INDEX "idx_generation_user_created" ON "generations" ("created_at", "user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_featured" ON "generations" ("is_featured") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_guest" ON "generations" ("created_at", "is_guest_generation") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_guest_ip" ON "generations" ("created_at", "guest_ip_address") `);
        await queryRunner.query(`CREATE INDEX "idx_generation_favorite_user" ON "generations" ("is_favorite", "user_id") `);
        await queryRunner.query(`ALTER TABLE "generations" ADD CONSTRAINT "FK_d2144f7590e23819132d9222968" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
