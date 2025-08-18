import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

@Entity('teams')
@Index('idx_team_owner', ['owner_id'])
@Index('idx_team_active', ['is_active'])
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'int', default: 5 })
  member_limit: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => TeamMember, teamMember => teamMember.team)
  members: TeamMember[];

  @OneToMany(() => SharedGeneration, sharedGeneration => sharedGeneration.team)
  shared_generations: SharedGeneration[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('team_members')
@Index('idx_team_member_team_user', ['team_id', 'user_id'])
@Index('idx_team_member_user', ['user_id'])
@Index('idx_team_member_active', ['team_id', 'is_active'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @ManyToOne(() => Team, team => team.members)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.MEMBER })
  role: TeamRole;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  invited_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('shared_generations')
@Index('idx_shared_generation_team', ['team_id', 'is_active'])
@Index('idx_shared_generation_user', ['shared_by_user_id'])
@Index('idx_shared_generation_created', ['team_id', 'created_at'])
export class SharedGeneration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  generation_id: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @ManyToOne(() => Team, team => team.shared_generations)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'uuid' })
  shared_by_user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'shared_by_user_id' })
  shared_by: User;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb' })
  ad_data: any;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}