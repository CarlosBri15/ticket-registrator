import { Injectable } from "@nestjs/common";
import { GoogleGenerativeAI, SchemaType} from "@google/generative-ai";
import { receiptPrompt, receiptSchema } from "./prompts";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractReceipt(imageBase64: string) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: receiptSchema,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
      {
        text: receiptPrompt,
      },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return parsed;
  }
}
