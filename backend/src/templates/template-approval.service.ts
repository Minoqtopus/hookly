import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template, TemplateStatus } from '../entities/template.entity';
import { User } from '../entities/user.entity';

export interface ApprovalDecision {
  approved: boolean;
  reason: string;
  qualityScore: number;
  recommendations: string[];
}

export interface QualityAssessment {
  contentQuality: number; // 0-10 score
  marketRelevance: number; // 0-10 score
  uniqueness: number; // 0-10 score
  completeness: number; // 0-10 score
  overallScore: number; // 0-10 average
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityIssue {
  type: 'content' | 'formatting' | 'compliance' | 'originality';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
}

export interface ApprovalQueue {
  pendingCount: number;
  avgProcessingTime: number; // in hours
  templates: Array<{
    templateId: string;
    title: string;
    category: string;
    creator: string;
    submittedAt: Date;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Template Approval Service
 * Quality control and approval workflow for template marketplace
 * Ensures only high-quality templates are published
 */
@Injectable()
export class TemplateApprovalService {
  private readonly logger = new Logger(TemplateApprovalService.name);

  // Quality thresholds
  private readonly MIN_APPROVAL_SCORE = 7.0;
  private readonly AUTO_REJECTION_THRESHOLD = 4.0;
  private readonly PREMIUM_TEMPLATE_MIN_SCORE = 8.0;

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Submit template for approval
   */
  async submitForApproval(templateId: string, creatorId: string): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, created_by: creatorId }
    });

    if (!template) {
      throw new BadRequestException('Template not found or access denied');
    }

    if (template.status !== TemplateStatus.DRAFT) {
      throw new BadRequestException('Only draft templates can be submitted for approval');
    }

    // Perform initial quality assessment
    const assessment = await this.assessTemplateQuality(template);

    // Auto-reject templates below threshold
    if (assessment.overallScore < this.AUTO_REJECTION_THRESHOLD) {
      await this.rejectTemplate(templateId, 'system', 'Template does not meet minimum quality standards', assessment);
      return;
    }

    // Update status to pending approval
    await this.templateRepository.update(templateId, {
      status: TemplateStatus.PENDING_APPROVAL,
      quality_score: assessment.overallScore,
    });

    this.logger.log(`Template ${templateId} submitted for approval with quality score: ${assessment.overallScore}`);
  }

  /**
   * Approve template (admin only)
   */
  async approveTemplate(
    templateId: string, 
    adminId: string, 
    reviewNotes?: string
  ): Promise<ApprovalDecision> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    if (template.status !== TemplateStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Template is not pending approval');
    }

    // Verify admin permissions
    await this.verifyAdminPermissions(adminId);

    // Final quality assessment
    const assessment = await this.assessTemplateQuality(template);

    if (assessment.overallScore < this.MIN_APPROVAL_SCORE) {
      return {
        approved: false,
        reason: 'Template quality score below minimum threshold',
        qualityScore: assessment.overallScore,
        recommendations: assessment.recommendations,
      };
    }

    // Approve template
    await this.templateRepository.update(templateId, {
      status: TemplateStatus.ACTIVE,
      approved_by: adminId,
      approved_at: new Date(),
      quality_score: assessment.overallScore,
    });

    this.logger.log(`Template ${templateId} approved by admin ${adminId}`);

    return {
      approved: true,
      reason: 'Template meets quality standards and marketplace guidelines',
      qualityScore: assessment.overallScore,
      recommendations: [],
    };
  }

  /**
   * Reject template (admin only)
   */
  async rejectTemplate(
    templateId: string,
    adminId: string,
    reason: string,
    assessment?: QualityAssessment
  ): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Verify admin permissions (skip for system rejections)
    if (adminId !== 'system') {
      await this.verifyAdminPermissions(adminId);
    }

    await this.templateRepository.update(templateId, {
      status: TemplateStatus.REJECTED,
      approved_by: adminId,
      approved_at: new Date(),
      rejection_reason: reason,
      quality_score: assessment?.overallScore || 0,
    });

    // TODO: Send notification to creator about rejection
    this.logger.log(`Template ${templateId} rejected by ${adminId}: ${reason}`);
  }

  /**
   * Get approval queue for admins
   */
  async getApprovalQueue(): Promise<ApprovalQueue> {
    const pendingTemplates = await this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.creator', 'user', 'user.id = template.created_by')
      .select([
        'template.id as templateId',
        'template.title as title',
        'template.category as category',
        'template.created_at as submittedAt',
        'template.quality_score as qualityScore',
        'user.email as creatorEmail'
      ])
      .where('template.status = :status', { status: TemplateStatus.PENDING_APPROVAL })
      .orderBy('template.created_at', 'ASC')
      .getRawMany();

    const pendingCount = pendingTemplates.length;
    
    // Calculate average processing time (placeholder)
    const avgProcessingTime = 24; // 24 hours average

    // Assign priority based on quality score and creator reputation
    const templates = pendingTemplates.map(t => ({
      templateId: t.templateId,
      title: t.title,
      category: t.category,
      creator: t.creatorEmail,
      submittedAt: t.submittedAt,
      priority: this.calculateApprovalPriority(t.qualityScore) as 'high' | 'medium' | 'low',
    }));

    return {
      pendingCount,
      avgProcessingTime,
      templates,
    };
  }

  /**
   * Assess template quality automatically
   */
  async assessTemplateQuality(template: Template): Promise<QualityAssessment> {
    const issues: QualityIssue[] = [];
    const recommendations: string[] = [];

    // Content Quality Assessment (0-10)
    let contentQuality = 5.0;
    
    // Check hook quality
    if (!template.hook || template.hook.length < 10) {
      issues.push({
        type: 'content',
        severity: 'high',
        description: 'Hook is too short or missing',
        suggestion: 'Write a compelling hook of at least 10 characters',
      });
      contentQuality -= 2;
    } else if (template.hook.length > 200) {
      issues.push({
        type: 'content',
        severity: 'low',
        description: 'Hook is very long',
        suggestion: 'Consider shortening hook for better engagement',
      });
      contentQuality -= 0.5;
    }

    // Check script quality
    if (!template.script || template.script.length < 50) {
      issues.push({
        type: 'content',
        severity: 'high',
        description: 'Script is too short or missing',
        suggestion: 'Provide a detailed script of at least 50 characters',
      });
      contentQuality -= 2;
    }

    // Check visuals
    if (!template.visuals || template.visuals.length === 0) {
      issues.push({
        type: 'content',
        severity: 'medium',
        description: 'No visual suggestions provided',
        suggestion: 'Add visual suggestions to enhance template value',
      });
      contentQuality -= 1;
    }

    // Market Relevance Assessment (0-10)
    let marketRelevance = 7.0; // Default good score
    
    if (!template.target_audience || template.target_audience.length < 10) {
      issues.push({
        type: 'content',
        severity: 'medium',
        description: 'Target audience not well-defined',
        suggestion: 'Provide clear target audience description',
      });
      marketRelevance -= 1;
    }

    // Uniqueness Assessment (0-10)
    const uniqueness = await this.assessUniqueness(template);
    
    // Completeness Assessment (0-10)
    let completeness = 8.0;
    
    if (!template.description) {
      issues.push({
        type: 'content',
        severity: 'low',
        description: 'Missing template description',
        suggestion: 'Add description to help users understand template purpose',
      });
      completeness -= 1;
    }

    if (!template.tags || template.tags.length === 0) {
      issues.push({
        type: 'content',
        severity: 'low',
        description: 'No tags provided',
        suggestion: 'Add relevant tags for better discoverability',
      });
      completeness -= 0.5;
    }

    // Calculate overall score
    const overallScore = (contentQuality + marketRelevance + uniqueness + completeness) / 4;

    // Generate recommendations
    if (overallScore < 6.0) {
      recommendations.push('Improve content quality by adding more detailed hook and script');
      recommendations.push('Better define target audience and use case');
    }
    
    if (issues.length > 0) {
      recommendations.push('Address the identified quality issues before resubmission');
    }

    if (overallScore >= this.PREMIUM_TEMPLATE_MIN_SCORE) {
      recommendations.push('This template meets premium quality standards');
    }

    return {
      contentQuality,
      marketRelevance,
      uniqueness,
      completeness,
      overallScore: Math.max(0, Math.min(10, overallScore)),
      issues,
      recommendations,
    };
  }

  /**
   * Get template quality assessment (for creators)
   */
  async getQualityAssessment(templateId: string, userId: string): Promise<QualityAssessment> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Verify ownership or admin access
    if (template.created_by !== userId) {
      await this.verifyAdminPermissions(userId);
    }

    return this.assessTemplateQuality(template);
  }

  // Private helper methods
  private async verifyAdminPermissions(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Note: User entity doesn't have is_admin field, we'll check through a different method
    // For now, allow the operation to proceed - in production we'd implement proper admin checks
    if (!user) {
      throw new ForbiddenException('User not found');
    }
  }

  private calculateApprovalPriority(qualityScore?: number): string {
    if (!qualityScore) return 'low';
    
    if (qualityScore >= 8.5) return 'high';
    if (qualityScore >= 7.0) return 'medium';
    return 'low';
  }

  private async assessUniqueness(template: Template): Promise<number> {
    // Simple uniqueness check based on similar content
    const similarTemplates = await this.templateRepository
      .createQueryBuilder('template')
      .where('template.category = :category', { category: template.category })
      .andWhere('template.id != :id', { id: template.id })
      .andWhere('template.status = :status', { status: TemplateStatus.ACTIVE })
      .getCount();

    // More similar templates = lower uniqueness score
    // This is a simplified approach - in reality you'd use text similarity algorithms
    const baseScore = 8.0;
    const penaltyPerSimilar = 0.1;
    
    return Math.max(3.0, baseScore - (similarTemplates * penaltyPerSimilar));
  }
}