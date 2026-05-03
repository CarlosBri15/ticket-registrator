import { Injectable, Logger } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import pdfParse from 'pdf-parse';
import { EmbeddingsService } from './embeddings.service';
import { PoliciesRepository } from './policies.repository';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly policiesRepository: PoliciesRepository,
  ) {}

  async processAndIngestPolicy(
    fileBuffer: Buffer,
    mimetype: string,
    companyId: string,
    name: string,
  ) {
    this.logger.log(`Starting ingestion for policy: ${name} (Company: ${companyId})`);

    // STEP 1: Extract Text
    let text = await this.extractTextFromFile(fileBuffer, mimetype);

    // OPTIONAL CLEANUP: Remove common noise like repetitive page headers if needed
    // text = text.replace(/some_regex/g, '');

    // STEP 2: Chunk Text
    const rawChunks = await this.chunkText(text);

    // STEP 3: Generate Embeddings
    this.logger.log(`Generating embeddings for ${rawChunks.length} chunks...`);
    const chunksWithEmbeddings: { content: string; embedding: number[]; chunkIndex: number }[] = [];
    
    for (let i = 0; i < rawChunks.length; i++) {
      const chunkText = rawChunks[i];
      // Note: In production you could use Promise.all to do this concurrently
      // but Gemini Flash/Embedding API has rate limits, so sequential is safer for now.
      const embedding = await this.embeddingsService.generateEmbedding(chunkText);
      
      chunksWithEmbeddings.push({
        content: chunkText,
        embedding: embedding,
        chunkIndex: i,
      });
    }

    // STEP 4: Save to Database
    this.logger.log(`Saving policy and ${chunksWithEmbeddings.length} chunks to database...`);
    const savedPolicy = await this.policiesRepository.savePolicyAndChunks(
      companyId,
      name,
      chunksWithEmbeddings,
    );

    this.logger.log(`Successfully ingested policy ID: ${savedPolicy.id}`);
    return {
      policyId: savedPolicy.id,
      chunksProcessed: chunksWithEmbeddings.length,
    };
  }

  //STEP 1: Parse the incoming document (PDF or raw text) into a single string.
  async extractTextFromFile(fileBuffer: Buffer, mimetype: string): Promise<string> {
    if (mimetype === 'application/pdf') {
      try {
        const data = await (pdfParse as any)(fileBuffer);
        return data.text;
      } catch (error) {
        this.logger.error('Failed to parse PDF document', error);
        throw new Error('Failed to parse PDF document');
      }
    }
    
    // Fallback to UTF-8 text parsing for md, txt, csv, etc.
    return fileBuffer.toString('utf8');
  }

    //STEP 2: Chunk the extracted text using semantic structural chunking.
    //We use a fixed token limit (500-800) but respect paragraph and sentence boundaries.
  async chunkText(text: string): Promise<string[]> {
    // 800 tokens is roughly 3200 characters (assuming ~4 chars per token)
    // We'll set chunk size to 3200 characters and overlap to 400 characters (100 tokens)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3200,
      chunkOverlap: 400,
    });

    const chunks = await splitter.splitText(text);
    this.logger.log(`Generated ${chunks.length} chunks from document`);
    return chunks;
  }
}
