import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillRegistrationTracking1756681698448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix critical security bug: Backfill registration IP tracking for existing users
        // This enables trial abuse prevention for all users
        
        console.log('🔐 Backfilling registration IP tracking for trial abuse prevention...');
        
        // Try to backfill from analytics events (earliest user events)
        const backfillFromAnalytics = await queryRunner.query(`
            WITH first_user_events AS (
                SELECT 
                    ae.user_id,
                    ae.ip_address,
                    ae.user_agent,
                    ROW_NUMBER() OVER (PARTITION BY ae.user_id ORDER BY ae.created_at ASC) as rn
                FROM analytics_events ae
                WHERE ae.user_id IS NOT NULL
                AND ae.ip_address IS NOT NULL
                AND ae.user_agent IS NOT NULL
            )
            UPDATE users 
            SET 
                registration_ip = fue.ip_address,
                registration_user_agent = fue.user_agent
            FROM first_user_events fue
            WHERE users.id = fue.user_id 
            AND fue.rn = 1
            AND users.registration_ip IS NULL
        `);
        
        console.log(`✅ Backfilled ${backfillFromAnalytics[1]} users from analytics events`);
        
        // For remaining users without analytics, set placeholder values to enable abuse prevention
        const placeholderBackfill = await queryRunner.query(`
            UPDATE users 
            SET 
                registration_ip = 'unknown',
                registration_user_agent = 'unknown-legacy-user'
            WHERE registration_ip IS NULL 
            AND plan = 'trial'
        `);
        
        console.log(`✅ Set placeholder tracking for ${placeholderBackfill[1]} legacy users`);
        
        // Verify the fix
        const verificationResult = await queryRunner.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(registration_ip) as with_ip_tracking,
                COUNT(CASE WHEN registration_ip = 'unknown' THEN 1 END) as placeholder_tracking,
                COUNT(CASE WHEN registration_ip != 'unknown' AND registration_ip IS NOT NULL THEN 1 END) as real_ip_tracking
            FROM users 
            WHERE plan = 'trial'
        `);
        
        console.log('📊 Post-migration registration tracking status:', verificationResult);
        console.log('🛡️  Trial abuse prevention now fully operational!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Clearing backfilled registration tracking...');
        
        // Clear backfilled data (not recommended as it disables security)
        await queryRunner.query(`
            UPDATE users 
            SET 
                registration_ip = NULL,
                registration_user_agent = NULL
            WHERE registration_ip = 'unknown' 
            OR registration_user_agent = 'unknown-legacy-user'
        `);
        
        console.log('⚠️  Registration tracking cleared (this disables trial abuse prevention)');
    }

}
