import { MigrationInterface, QueryRunner } from "typeorm";

export class FixInstagramAccessDefault1756681126728 implements MigrationInterface {
    name = 'FixInstagramAccessDefault1756681126728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix business logic bug: Trial users should have Instagram access according to pricing config
        
        // 1. Update default for new users
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "has_instagram_access" SET DEFAULT true`);
        
        // 2. Update existing trial users to have Instagram access
        await queryRunner.query(`
            UPDATE users 
            SET has_instagram_access = true 
            WHERE plan = 'trial' AND has_instagram_access = false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert default back to false
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "has_instagram_access" SET DEFAULT false`);
        
        // Note: Not reverting existing user data as it would negatively impact user experience
        // Trial users should keep Instagram access they were promised
    }

}
