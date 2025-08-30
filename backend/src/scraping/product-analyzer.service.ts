/**
 * PRODUCT URL ANALYZER SERVICE
 * 
 * Bootstrap-friendly web scraping with graceful fallbacks
 * Security-first implementation with proper error handling
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

export interface ProductAnalysisResult {
  success: boolean;
  product_name: string;
  description: string;
  features: string[];
  target_audience: string;
  niche: string;
  price_positioning: 'budget' | 'mid-tier' | 'premium';
  confidence_score: number;
  analysis_method: 'scraped' | 'fallback';
  error?: string;
}

@Injectable()
export class ProductAnalyzerService {
  private readonly logger = new Logger(ProductAnalyzerService.name);
  private readonly maxAnalysisTime = 15000; // 15 seconds max
  private readonly allowedDomains = [
    'shopify.com',
    'stripe.com', 
    'gumroad.com',
    'lemonsqueezy.com',
    'producthunt.com',
    // Add more as needed
  ];

  constructor(private configService: ConfigService) {}

  /**
   * Analyze product from URL with graceful fallback to manual input
   */
  async analyzeProductUrl(url: string): Promise<ProductAnalysisResult> {
    this.logger.log(`🔍 Analyzing product URL: ${url}`);
    
    try {
      // Validate URL first
      await this.validateUrl(url);
      
      // Attempt web scraping
      const scrapedData = await this.scrapeProductPage(url);
      
      if (scrapedData) {
        this.logger.log(`✅ Successfully scraped product data from ${url}`);
        return {
          success: true,
          product_name: scrapedData.product_name || 'Unknown Product',
          description: scrapedData.description || 'Description not available',
          features: scrapedData.features || [],
          target_audience: scrapedData.target_audience || 'General audience',
          niche: scrapedData.niche || 'General',
          price_positioning: scrapedData.price_positioning || 'mid-tier',
          confidence_score: 85,
          analysis_method: 'scraped'
        };
      }
      
      // If scraping fails, return fallback structure
      return this.createFallbackAnalysis(url);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`⚠️ Product analysis failed for ${url}: ${errorMessage}`);
      return this.createFallbackAnalysis(url, errorMessage);
    }
  }

  /**
   * Validate URL for security and feasibility
   */
  private async validateUrl(url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      
      // Security checks
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new BadRequestException('Only HTTP/HTTPS URLs are allowed');
      }
      
      // Check if localhost or private IP (security)
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        throw new BadRequestException('Local/private URLs are not allowed');
      }
      
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid URL format');
    }
  }

  /**
   * Scrape product page with timeout and error handling
   */
  private async scrapeProductPage(url: string): Promise<Partial<ProductAnalysisResult> | null> {
    let browser;
    
    try {
      // Launch browser with minimal resources (bootstrap-friendly)
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--single-process'
        ],
        timeout: this.maxAnalysisTime
      });

      const page = await browser.newPage();
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Navigate with timeout
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: this.maxAnalysisTime 
      });

      // Extract product information using string-based evaluation
      const productData = await page.evaluate(`(() => {
        const getText = (selector) => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '';
        };

        const getTexts = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent?.trim() || '').filter(Boolean);
        };

        // Common selectors for product information
        const titleSelectors = [
          'h1',
          '.product-title',
          '.product-name', 
          '[data-testid="product-title"]',
          'title'
        ];

        const descriptionSelectors = [
          '.product-description',
          '.description',
          '[data-testid="description"]',
          'meta[name="description"]',
          '.product-summary'
        ];

        const featureSelectors = [
          '.features li',
          '.benefits li',
          '.product-features li',
          '[data-testid="features"] li'
        ];

        // Extract title
        let title = '';
        for (const selector of titleSelectors) {
          title = getText(selector);
          if (title) break;
        }

        // Extract description
        let description = '';
        for (const selector of descriptionSelectors) {
          if (selector.includes('meta')) {
            const meta = document.querySelector(selector);
            description = meta?.content || '';
          } else {
            description = getText(selector);
          }
          if (description && description.length > 50) break;
        }

        // Extract features
        let features = [];
        for (const selector of featureSelectors) {
          features = getTexts(selector);
          if (features.length > 0) break;
        }

        // Try to detect price for positioning
        const priceText = getText('.price, .pricing, [data-testid="price"]') || '';
        const hasPrice = /\\$\\d+/.test(priceText);
        const price = hasPrice ? priceText.match(/\\$(\\d+)/)?.[1] : null;

        return {
          title: title || document.title || '',
          description: description || '',
          features: features.slice(0, 10), // Limit to 10 features
          priceText,
          price: price ? parseInt(price) : null,
          url: window.location.href
        };
      })()`);

      // Process the scraped data
      if (productData.title) {
        return {
          product_name: productData.title,
          description: productData.description || 'Product description not available',
          features: productData.features || [],
          target_audience: this.inferTargetAudience(productData.title, productData.description),
          niche: this.inferNiche(productData.title, productData.description),
          price_positioning: this.inferPricePositioning(productData.price)
        };
      }

      return null;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Scraping failed for ${url}:`, errorMessage);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Create fallback analysis when scraping fails
   */
  private createFallbackAnalysis(url: string, error?: string): ProductAnalysisResult {
    const domain = new URL(url).hostname;
    
    return {
      success: false,
      product_name: this.inferProductNameFromUrl(url),
      description: 'Unable to analyze product automatically. Please provide details manually.',
      features: [],
      target_audience: 'General audience',
      niche: 'General',
      price_positioning: 'mid-tier',
      confidence_score: 30,
      analysis_method: 'fallback',
      error: error || 'Product analysis not available'
    };
  }

  /**
   * Infer product name from URL structure
   */
  private inferProductNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract potential product name from path
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        return lastSegment
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      // Fallback to domain
      return urlObj.hostname.replace('www.', '').split('.')[0];
    } catch {
      return 'Unknown Product';
    }
  }

  /**
   * Infer target audience from product content
   */
  private inferTargetAudience(title: string, description: string): string {
    const content = `${title} ${description}`.toLowerCase();
    
    const audiences = [
      { keywords: ['saas', 'software', 'developer', 'api', 'business'], audience: 'SaaS founders and developers' },
      { keywords: ['fitness', 'health', 'workout', 'gym'], audience: 'Fitness enthusiasts' },
      { keywords: ['marketing', 'social media', 'content', 'brand'], audience: 'Marketing professionals' },
      { keywords: ['startup', 'entrepreneur', 'business owner'], audience: 'Entrepreneurs and startup founders' },
      { keywords: ['designer', 'creative', 'art', 'design'], audience: 'Designers and creatives' },
      { keywords: ['freelancer', 'remote', 'productivity'], audience: 'Freelancers and remote workers' }
    ];

    for (const { keywords, audience } of audiences) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return audience;
      }
    }

    return 'General audience';
  }

  /**
   * Infer niche from product content
   */
  private inferNiche(title: string, description: string): string {
    const content = `${title} ${description}`.toLowerCase();
    
    const niches = [
      { keywords: ['saas', 'software', 'api', 'platform'], niche: 'SaaS/Software' },
      { keywords: ['marketing', 'social media', 'seo'], niche: 'Digital Marketing' },
      { keywords: ['health', 'fitness', 'wellness'], niche: 'Health & Fitness' },
      { keywords: ['productivity', 'organization', 'planning'], niche: 'Productivity' },
      { keywords: ['education', 'course', 'learning'], niche: 'Education' },
      { keywords: ['finance', 'money', 'investment'], niche: 'Finance' },
      { keywords: ['design', 'creative', 'art'], niche: 'Design' }
    ];

    for (const { keywords, niche } of niches) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return niche;
      }
    }

    return 'General';
  }

  /**
   * Infer price positioning from detected price
   */
  private inferPricePositioning(price: number | null): 'budget' | 'mid-tier' | 'premium' {
    if (!price) return 'mid-tier';
    
    if (price < 50) return 'budget';
    if (price < 200) return 'mid-tier';
    return 'premium';
  }
}