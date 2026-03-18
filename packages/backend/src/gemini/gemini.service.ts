import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { IReceiptExtraction } from '@ticket-registrator/shared';
import { getReceiptPrompt, receiptSchema } from './prompts';
import { GeminiExtractionException } from './exceptions/gemini.exceptions';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.logger.log('GeminiService initialized');
  }

  async extractReceipt(
    imageBase64: string,
    languageCode: string = 'es',
  ): Promise<IReceiptExtraction> {
    this.logger.log(`Extracting receipt data. Language Code: ${languageCode}`);
    // this.logger.debug(`Prompt: ${prompt}`);

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: getReceiptPrompt(languageCode),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: receiptSchema,
        temperature: 0,
        // thinkingConfig is valid for Gemini 2.0 but might be missing from SDK types
        thinkingConfig: { thinkingBudget: 128 },
      } as any,
    });

    try {
      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
      ]);

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText) as IReceiptExtraction;

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
        `Tokens:
      Prompt: ${promptTokenCount}
      Completion: ${candidatesTokenCount}
      Thinking: ${thinkingTokens}
      Cached: ${cachedContentTokenCount}
      Total: ${totalTokenCount}

      Cost:
      Input: $${inputCost.toFixed(6)}
      Cached: $${cachedCost.toFixed(6)}
      Output: $${outputCost.toFixed(6)}
      Total: $${totalCost.toFixed(6)}`,
      );

      return parsed;
    } catch (error) {
      this.logger.error('Receipt extraction failed', error);
      throw new GeminiExtractionException();
    }
  }
}
