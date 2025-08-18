import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template, TemplateCategory, TemplateStatus } from '../entities/template.entity';

interface TemplateFilters {
  category?: TemplateCategory;
  popular?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async getTemplates(filters: TemplateFilters) {
    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .where('template.status = :status', { status: TemplateStatus.ACTIVE });

    if (filters.category) {
      queryBuilder.andWhere('template.category = :category', { category: filters.category });
    }

    if (filters.popular) {
      queryBuilder.andWhere('template.is_popular = :popular', { popular: true });
    }

    if (filters.featured) {
      queryBuilder.andWhere('template.is_featured = :featured', { featured: true });
    }

    queryBuilder
      .orderBy('template.performance_score', 'DESC')
      .addOrderBy('template.usage_count', 'DESC')
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    const [templates, total] = await queryBuilder.getManyAndCount();

    return {
      templates: templates.map(template => this.formatTemplate(template)),
      total,
      pagination: {
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        totalPages: Math.ceil(total / (filters.limit || 50)),
      },
    };
  }

  async getPopularTemplates(limit: number = 10) {
    const templates = await this.templateRepository.find({
      where: {
        status: TemplateStatus.ACTIVE,
        is_popular: true,
      },
      order: {
        performance_score: 'DESC',
        usage_count: 'DESC',
      },
      take: limit,
    });

    return templates.map(template => this.formatTemplate(template));
  }

  async getCategories() {
    const categories = await this.templateRepository
      .createQueryBuilder('template')
      .select('template.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('template.status = :status', { status: TemplateStatus.ACTIVE })
      .groupBy('template.category')
      .orderBy('count', 'DESC')
      .getRawMany();

    return categories.map(cat => ({
      category: cat.category,
      count: parseInt(cat.count),
      displayName: this.getCategoryDisplayName(cat.category),
    }));
  }

  async getTemplate(id: string) {
    const template = await this.templateRepository.findOne({
      where: { id, status: TemplateStatus.ACTIVE },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.formatTemplate(template);
  }

  async trackTemplateUsage(templateId: string, userId: string) {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, status: TemplateStatus.ACTIVE },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Increment usage count
    template.usage_count += 1;
    
    // Update performance score (simple algorithm: usage count * 0.1 + popular bonus)
    template.performance_score = (template.usage_count * 0.1) + (template.is_popular ? 2 : 0);

    await this.templateRepository.save(template);

    return {
      success: true,
      message: 'Template usage tracked',
      template: this.formatTemplate(template),
    };
  }

  private formatTemplate(template: Template) {
    return {
      id: template.id,
      title: template.title,
      category: template.category,
      niche: template.category, // For backward compatibility
      targetAudience: template.target_audience,
      hook: template.hook,
      script: template.script,
      visuals: template.visuals,
      performance: template.performance_metrics,
      tags: template.tags || [],
      isPopular: template.is_popular,
      isFeatured: template.is_featured,
      usageCount: template.usage_count,
      performanceScore: parseFloat(template.performance_score.toString()),
      createdAt: template.created_at,
    };
  }

  private getCategoryDisplayName(category: TemplateCategory): string {
    const displayNames = {
      [TemplateCategory.BEAUTY]: 'Beauty',
      [TemplateCategory.FITNESS]: 'Fitness',
      [TemplateCategory.TECH]: 'Technology',
      [TemplateCategory.FOOD]: 'Food & Beverage',
      [TemplateCategory.FASHION]: 'Fashion',
      [TemplateCategory.EDUCATION]: 'Education',
      [TemplateCategory.LIFESTYLE]: 'Lifestyle',
      [TemplateCategory.BUSINESS]: 'Business',
    };

    return displayNames[category] || category;
  }

  // Admin methods for seeding data
  async createTemplate(templateData: Partial<Template>) {
    const template = this.templateRepository.create(templateData);
    return this.templateRepository.save(template);
  }

  async seedTemplates() {
    const existingCount = await this.templateRepository.count();
    if (existingCount > 0) {
      return { message: 'Templates already seeded', count: existingCount };
    }

    const templatesData = await this.getHardcodedTemplates();
    const templates = templatesData.map(data => this.templateRepository.create(data));
    const savedTemplates = await this.templateRepository.save(templates);

    return {
      message: 'Templates seeded successfully',
      count: savedTemplates.length,
      templates: savedTemplates.map(t => this.formatTemplate(t)),
    };
  }

  private async getHardcodedTemplates() {
    return [
      {
        title: 'Skincare Transformation',
        category: TemplateCategory.BEAUTY,
        target_audience: 'Women aged 25-45 with skin concerns',
        hook: 'I used to hide my acne with 5 layers of makeup until I found this one ingredient...',
        script: `I used to hide my acne with 5 layers of makeup until I found this one ingredient...

*holds up product*

This serum changed everything. Look at my skin now - no filter, no makeup.

*shows before/after photos*

The secret? It has 2% salicylic acid that actually penetrates your pores, unlike those drugstore products that just sit on top.

I've been using it for 3 months and people keep asking if I got professional treatments.

*applies product to face*

The best part? It's only $29 and lasts forever. Link in my bio - but hurry, they're doing 30% off this week only.

Trust me, your future self will thank you.`,
        visuals: [
          'Close-up of applying makeup to cover acne',
          'Holding the serum product with confident smile',
          'Split-screen before/after transformation',
          'Detailed product application on clean face',
          'Final result - glowing, clear skin'
        ],
        performance_metrics: {
          estimated_views: 156000,
          estimated_ctr: 4.8,
          viral_score: 8.9
        },
        tags: ['skincare', 'transformation', 'before-after'],
        is_popular: true,
        is_featured: true,
        performance_score: 8.9,
        status: TemplateStatus.ACTIVE,
      },
      {
        title: 'Protein Powder Results',
        category: TemplateCategory.FITNESS,
        target_audience: 'Gym enthusiasts and athletes aged 20-40',
        hook: 'My trainer said I\'d never build muscle as a vegetarian. Then I found this...',
        script: `My trainer said I'd never build muscle as a vegetarian. Then I found this...

*flexes in gym mirror*

This plant-based protein has 30g per scoop - more than most whey proteins.

*shows transformation photos*

6 months ago I was 140lbs and weak. Now I'm 165lbs of lean muscle.

*scoops protein powder*

The difference? This has all 9 essential amino acids that your body can't make. Most plant proteins are incomplete.

Plus it tastes like a vanilla milkshake - not like grass clippings.

*drinks shake*

I'm not saying ditch the gym, but having the right fuel makes all the difference.

Use my code GAINS20 for 20% off your first order.`,
        visuals: [
          'Disappointed face talking to trainer',
          'Flexing progress in gym mirror',
          'Side-by-side transformation photos',
          'Scooping protein powder into shaker',
          'Enjoying the protein shake post-workout'
        ],
        performance_metrics: {
          estimated_views: 89000,
          estimated_ctr: 3.6,
          viral_score: 7.4
        },
        tags: ['fitness', 'transformation', 'plant-based'],
        is_popular: false,
        is_featured: true,
        performance_score: 7.4,
        status: TemplateStatus.ACTIVE,
      },
      {
        title: 'Productivity App Secret',
        category: TemplateCategory.TECH,
        target_audience: 'Busy professionals and students aged 22-35',
        hook: 'I was working 70-hour weeks until I discovered this productivity hack...',
        script: `I was working 70-hour weeks until I discovered this productivity hack...

*shows chaotic desk with multiple screens*

My life was complete chaos. Meetings, deadlines, constant stress.

*opens phone app*

Then I found this app that uses the Pomodoro Technique with AI optimization.

*shows clean, organized workspace*

It analyzes when you're most productive and schedules your hardest tasks for those peak hours.

*demonstrates app features*

Now I finish everything by 5 PM and actually have a life.

The crazy part? It's free for basic features, and Pro is only $5/month.

*relaxing at home in evening*

Downloaded it 3 months ago and my productivity increased by 340%. Not kidding.

Link in bio - your future self will thank you.`,
        visuals: [
          'Messy desk with stressed person working late',
          'Phone screen showing the productivity app',
          'Clean, organized workspace transformation',
          'App interface with scheduling features',
          'Person relaxing at home in evening light'
        ],
        performance_metrics: {
          estimated_views: 234000,
          estimated_ctr: 5.2,
          viral_score: 9.1
        },
        tags: ['productivity', 'app', 'work-life-balance'],
        is_popular: true,
        is_featured: true,
        performance_score: 9.1,
        status: TemplateStatus.ACTIVE,
      },
      {
        title: 'Coffee Shop Marketing',
        category: TemplateCategory.FOOD,
        target_audience: 'Coffee lovers and local business supporters aged 25-50',
        hook: 'This local coffee shop was about to close until they tried one simple marketing trick...',
        script: `This local coffee shop was about to close until they tried one simple marketing trick...

*sad empty coffee shop*

Sarah's Café was my favorite spot, but hardly anyone knew about it.

*shows owner looking worried*

The owner Sarah was about to shut down after 10 years.

*lightbulb moment*

Then I suggested she start posting her latte art on TikTok.

*filming latte art creation process*

She went from 50 followers to 10K in two months.

*busy coffee shop with lines*

Now there's a line out the door every morning.

*happy customers with beautiful lattes*

The secret? People don't just buy coffee - they buy the experience.

*Sarah smiling behind counter*

Sometimes the best marketing is just showing people what you're passionate about.

Support your local businesses - they need us now more than ever.`,
        visuals: [
          'Empty coffee shop with sad atmosphere',
          'Owner looking worried behind counter',
          'Close-up of beautiful latte art being made',
          'Phone filming the latte art process',
          'Busy coffee shop with happy customers'
        ],
        performance_metrics: {
          estimated_views: 67000,
          estimated_ctr: 2.8,
          viral_score: 6.3
        },
        tags: ['local-business', 'coffee', 'marketing'],
        is_popular: false,
        is_featured: false,
        performance_score: 6.3,
        status: TemplateStatus.ACTIVE,
      },
      {
        title: 'Study Technique Revolution',
        category: TemplateCategory.EDUCATION,
        target_audience: 'Students aged 16-25 struggling with academics',
        hook: 'I went from failing to straight A\'s using this ancient study technique...',
        script: `I went from failing to straight A's using this ancient study technique...

*shows failed test papers*

Last semester I was on academic probation. My GPA was 1.8.

*stressed student cramming*

I was pulling all-nighters, drinking energy drinks, memorizing everything.

*discovers technique*

Then my professor mentioned the Feynman Technique - used by Nobel Prize winners.

*explains on whiteboard*

Instead of memorizing, you explain concepts in simple terms like you're teaching a 5-year-old.

*teaching to camera*

If you can't explain it simply, you don't understand it.

*shows improved grades*

This semester? 3.9 GPA. No all-nighters. No stress.

*confident student*

The trick isn't studying harder - it's studying smarter.

Try this for one week and watch your grades transform.`,
        visuals: [
          'Stack of failed tests with red marks',
          'Stressed student surrounded by books at 3 AM',
          'Writing the Feynman Technique on whiteboard',
          'Teaching concept to camera enthusiastically',
          'Showing straight A report card with pride'
        ],
        performance_metrics: {
          estimated_views: 312000,
          estimated_ctr: 6.1,
          viral_score: 8.7
        },
        tags: ['education', 'study-tips', 'academic-success'],
        is_popular: true,
        is_featured: true,
        performance_score: 8.7,
        status: TemplateStatus.ACTIVE,
      }
    ];
  }
}