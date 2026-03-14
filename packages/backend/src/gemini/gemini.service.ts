import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { receiptPrompt, receiptSchema } from './prompts';
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
  }

  async extractReceipt(imageBase64: string): Promise<Record<string, unknown>> {
    this.logger.log('Extracting receipt data from image');

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: receiptSchema,
        },
      });

      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
        { text: receiptPrompt },
      ]);

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      this.logger.log('Receipt extraction successful');
      return parsed;
    } catch (error) {
      this.logger.error('Receipt extraction failed', error);
      throw new GeminiExtractionException();
    }
  }
}
