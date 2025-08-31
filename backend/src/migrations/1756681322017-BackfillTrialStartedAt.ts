import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillTrialStartedAt1756681322017 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix business logic bug: Backfill missing trial_started_at values
        // For existing users, set trial_started_at to their account creation date
        
        console.log('🔧 Backfilling missing trial_started_at values...');
        
        const updateResult = await queryRunner.query(`
            UPDATE users 
            SET trial_started_at = created_at 
            WHERE plan = 'trial' 
            AND trial_started_at IS NULL 
            AND created_at IS NOT NULL
        `);
        
        console.log(`✅ Updated ${updateResult[1]} trial users with trial_started_at values`);
        
        // Verify the fix
        const verificationResult = await queryRunner.query(`
            SELECT 
                COUNT(*) as total_trials,
                COUNT(trial_started_at) as with_start_date,
                COUNT(trial_ends_at) as with_end_date
            FROM users 
            WHERE plan = 'trial'
        `);
        
        console.log('📊 Post-migration trial date tracking:', verificationResult);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Clearing backfilled trial_started_at values...');
        
        // Revert by clearing trial_started_at (but this is not recommended)
        await queryRunner.query(`
            UPDATE users 
            SET trial_started_at = NULL 
            WHERE plan = 'trial' 
            AND trial_started_at = created_at
        `);
        
        console.log('⚠️  Cleared trial_started_at values (this reduces data integrity)');
    }

}
