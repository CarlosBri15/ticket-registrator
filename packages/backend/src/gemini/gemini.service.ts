import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  type GenerationConfig,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { IReceiptExtraction } from '@ticket-registrator/shared';
import { getReceiptPrompt, receiptSchema } from './prompts';
import { GeminiExtractionException } from './exceptions/gemini.exceptions';
import { CategoriesRepository } from '../categories/categories.repository';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly categoriesRepository: CategoriesRepository,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.logger.log('GeminiService initialized');
  }

  async extractReceipt(
    imageBase64: string,
    organizationId: string | null,
    mimeType: string = 'image/jpeg',
    languageCode: string = 'es',
  ): Promise<IReceiptExtraction> {
    this.logger.log(
      `Extracting receipt data. Org: ${organizationId}, Lang: ${languageCode}`,
    );

    // Fetch categories for this organization
    const categories =
      await this.categoriesRepository.findByOrganization(organizationId);
    const categoryPairs = categories.map((c) => ({
      name: c.name,
      description: c.description,
    }));

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: getReceiptPrompt(languageCode, categoryPairs),
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: receiptSchema,
        temperature: 0,
        thinkingConfig: { thinkingBudget: 128 },
      } as unknown as GenerationConfig,
    });

    try {
      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType } },
      ]);

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText) as IReceiptExtraction;

      // Map category names back to IDs
      if (parsed.items) {
        parsed.items = parsed.items.map((item) => {
          const category = categories.find((c) => c.name === item.category);
          return {
            ...item,
            categoryId: category?.id,
          };
        });
      }

      const {
        promptTokenCount = 0,
        candidatesTokenCount = 0,
        totalTokenCount = 0,
        cachedContentTokenCount = 0,
      } = result.response.usageMetadata ?? {};

      const INPUT_PRICE = 0.3 / 1_000_000;
      const OUTPUT_PRICE = 2.5 / 1_000_000;
      const CACHE_PRICE = 0.03 / 1_000_000;

      const thinkingTokens = Math.max(
        0,
        totalTokenCount - promptTokenCount - candidatesTokenCount,
      );

      const billedOutputTokens = candidatesTokenCount + thinkingTokens;
      const uncachedPromptTokens = promptTokenCount - cachedContentTokenCount;

      const inputCost = uncachedPromptTokens * INPUT_PRICE;
      const cachedCost = cachedContentTokenCount * CACHE_PRICE;
      const outputCost = billedOutputTokens * OUTPUT_PRICE;
      const totalCost = inputCost + cachedCost + outputCost;

      this.logger.log(
        `Tokens: P:${promptTokenCount} C:${candidatesTokenCount} T:${thinkingTokens} Ca:${cachedContentTokenCount} Tot:${totalTokenCount}`,
      );
      this.logger.log(`Cost: $${totalCost.toFixed(6)}`);

      return parsed;
    } catch (error) {
      this.logger.error('Receipt extraction failed', error);
      throw new GeminiExtractionException();
    }
  }
}
