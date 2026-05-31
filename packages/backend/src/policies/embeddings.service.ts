import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly embeddingModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Instanciar una sola vez
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'gemini-embedding-2',
    });

    this.logger.log('EmbeddingsService initialized');
  }

  // Embedding para documentos (RAG)
  async embedDocument(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        outputDimensionality: 768,
      });

      return result.embedding.values;
    } catch (error) {
      this.logger.error('Document embedding failed', error);
      throw new Error('Failed to generate document embedding');
    }
  }
}
