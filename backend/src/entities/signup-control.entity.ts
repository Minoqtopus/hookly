import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Check } from 'typeorm';

@Entity('signup_control')
@Check(`"total_signups_completed" <= "total_signups_allowed"`)
@Check(`"beta_signups_completed" <= "beta_signups_allowed"`)
@Check(`"total_signups_completed" >= 0`)
@Check(`"beta_signups_completed" >= 0`)
@Check(`"total_signups_allowed" >= 0`)
@Check(`"beta_signups_allowed" >= 0`)
export class SignupControl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 100 })
  total_signups_allowed: number;

  @Column({ type: 'int', default: 0 })
  total_signups_completed: number;

  @Column({ type: 'boolean', default: true })
  is_signup_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  signup_message: string;

  @Column({ type: 'int', default: 50 })
  beta_signups_allowed: number;

  @Column({ type: 'int', default: 0 })
  beta_signups_completed: number;

  @Column({ type: 'boolean', default: true })
  is_beta_signup_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  beta_signup_message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_updated: Date;

  // Helper methods
  canSignup(): boolean {
    return this.is_signup_enabled && this.total_signups_completed < this.total_signups_allowed;
  }

  canBetaSignup(): boolean {
    return this.is_beta_signup_enabled && this.beta_signups_completed < this.beta_signups_allowed;
  }

  getRemainingSignups(): number {
    return Math.max(0, this.total_signups_allowed - this.total_signups_completed);
  }

  getRemainingBetaSignups(): number {
    return Math.max(0, this.beta_signups_allowed - this.beta_signups_completed);
  }

  incrementSignup(): void {
    this.total_signups_completed++;
    this.last_updated = new Date();
  }

  incrementBetaSignup(): void {
    this.beta_signups_completed++;
    this.last_updated = new Date();
  }

  updateLimits(allowed: number, betaAllowed: number): void {
    this.total_signups_allowed = allowed;
    this.beta_signups_allowed = betaAllowed;
    this.last_updated = new Date();
  }

  toggleSignup(enabled: boolean): void {
    this.is_signup_enabled = enabled;
    this.last_updated = new Date();
  }

  toggleBetaSignup(enabled: boolean): void {
    this.is_beta_signup_enabled = enabled;
    this.last_updated = new Date();
  }
}
