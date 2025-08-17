import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface UGCGenerationInput {
  productName: string;
  niche: string;
  targetAudience: string;
}

export interface UGCGenerationOutput {
  script: string;
  hook: string;
  visuals: string[];
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateUGCContent(input: UGCGenerationInput): Promise<UGCGenerationOutput> {
    const { productName, niche, targetAudience } = input;

    const prompt = `Create a TikTok UGC ad script for the following product:

Product: ${productName}
Niche: ${niche}
Target Audience: ${targetAudience}

Please provide:
1. A compelling hook (1-2 sentences that grab attention in the first 3 seconds)
2. A full script (30-60 seconds, conversational, authentic UGC style)
3. Visual suggestions (5-7 specific shot ideas for the video)

Format your response as JSON with the following structure:
{
  "hook": "your hook here",
  "script": "your full script here",
  "visuals": ["visual 1", "visual 2", "visual 3", "visual 4", "visual 5"]
}

Make it sound authentic, relatable, and focused on solving a problem or showing results. Use a conversational tone that doesn't feel like a traditional ad.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UGC content creator who specializes in creating viral TikTok ads. You understand what makes content engaging, authentic, and conversion-focused.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const responseContent = completion.choices[0].message.content;
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseContent);
      
      return {
        script: parsedResponse.script,
        hook: parsedResponse.hook,
        visuals: parsedResponse.visuals || [],
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate UGC content');
    }
  }
}