import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanupAccumulatedRefreshTokens1756748392456 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🧹 Starting refresh token cleanup migration...');
        
        // Step 1: Delete all expired tokens (no value, cleanup immediately)
        const expiredResult = await queryRunner.query(`
            DELETE FROM refresh_tokens 
            WHERE expires_at < NOW()
        `);
        console.log(`✅ Deleted ${expiredResult[1]} expired tokens`);
        
        // Step 2: Delete revoked tokens older than 7 days (hybrid strategy)
        const revokedResult = await queryRunner.query(`
            DELETE FROM refresh_tokens 
            WHERE is_revoked = true 
            AND revoked_at < (NOW() - INTERVAL '7 days')
        `);
        console.log(`✅ Deleted ${revokedResult[1]} old revoked tokens`);
        
        // Step 3: For users with multiple active tokens, keep only the most recent one
        // This fixes the accumulation issue (user with 27 active tokens)
        const cleanupMultipleTokens = await queryRunner.query(`
            WITH ranked_tokens AS (
                SELECT 
                    id,
                    user_id,
                    created_at,
                    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
                FROM refresh_tokens 
                WHERE is_revoked = false 
                AND expires_at > NOW()
            )
            UPDATE refresh_tokens 
            SET 
                is_revoked = true,
                revoked_at = NOW(),
                revoked_reason = 'Migration cleanup - duplicate active token'
            FROM ranked_tokens 
            WHERE refresh_tokens.id = ranked_tokens.id 
            AND ranked_tokens.rn > 1
        `);
        console.log(`✅ Revoked ${cleanupMultipleTokens[1]} duplicate active tokens`);
        
        // Step 4: Show final statistics
        const finalStats = await queryRunner.query(`
            SELECT 
                COUNT(*) as total_tokens,
                COUNT(CASE WHEN is_revoked = false THEN 1 END) as active_tokens,
                COUNT(CASE WHEN is_revoked = true THEN 1 END) as revoked_tokens,
                COUNT(DISTINCT user_id) as unique_users
            FROM refresh_tokens
        `);
        
        console.log('📊 Final refresh token statistics after cleanup:');
        console.log(`    Total tokens: ${finalStats[0].total_tokens}`);
        console.log(`    Active tokens: ${finalStats[0].active_tokens}`);
        console.log(`    Revoked tokens: ${finalStats[0].revoked_tokens}`);
        console.log(`    Users with tokens: ${finalStats[0].unique_users}`);
        
        // Step 5: Validate cleanup success
        const problemUsers = await queryRunner.query(`
            SELECT 
                user_id,
                COUNT(CASE WHEN is_revoked = false THEN 1 END) as active_count
            FROM refresh_tokens 
            WHERE is_revoked = false 
            AND expires_at > NOW()
            GROUP BY user_id 
            HAVING COUNT(CASE WHEN is_revoked = false THEN 1 END) > 1
        `);
        
        if (problemUsers.length > 0) {
            console.log(`⚠️  Warning: ${problemUsers.length} users still have multiple active tokens`);
            problemUsers.forEach(user => {
                console.log(`    User ${user.user_id}: ${user.active_count} active tokens`);
            });
        } else {
            console.log('✅ Success: All users now have at most 1 active token');
        }
        
        console.log('🎉 Refresh token cleanup migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  Cannot rollback refresh token cleanup - tokens were deleted permanently');
        console.log('💡 This is by design for security reasons - old tokens should not be restored');
        // Intentionally empty - we cannot and should not restore deleted tokens
    }
}