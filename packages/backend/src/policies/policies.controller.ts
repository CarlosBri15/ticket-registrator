import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PoliciesService } from './policies.service';
import { RetrievalService } from './retrieval.service';
import { IngestPolicyDto } from './dto/ingest-document.dto';

@Controller('policies')
export class PoliciesController {
  constructor(
    private readonly policiesService: PoliciesService,
    private readonly retrievalService: RetrievalService,
  ) {}

  @Post('ingest')
  @UseInterceptors(FileInterceptor('file'))
  async ingestPolicy(
    @UploadedFile() file: Express.Multer.File,
    @Body() ingestDto: IngestPolicyDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please upload a file using the "file" form-data field.');
    }

    const result = await this.policiesService.processAndIngestPolicy(
      file.buffer,
      file.mimetype,
      ingestDto.companyId,
      ingestDto.name,
    );

    return {
      message: 'Successfully ingested policy document',
      ...result,
    };
  }

  @Post('test-chunking')
  @UseInterceptors(FileInterceptor('file'))
  async testChunking(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // Step 1: extract one Document per page
    const pageDocuments = await this.policiesService.extractTextFromFile(file.buffer, file.mimetype);
    // Step 2: semantic chunk across all pages
    const chunks = await this.policiesService.chunkDocuments(pageDocuments);

    return {
      message: 'Successfully parsed and chunked document (Testing Only)',
      totalChunks: chunks.length,
      chunks: chunks,
      // Combine all page markdown so the caller can inspect the raw extraction
      rawExtractedMarkdown: pageDocuments.map((d) => d.pageContent).join('\n\n---\n\n'),
    };
  }

  // --- RETRIEVAL TESTING ENDPOINTS ---

  @Get('test-retrieval/ticket/:ticketId')
  async testSerializeTicket(@Param('ticketId') ticketId: string) {
    const jsonStr = await this.retrievalService.serializeTicketForLLM(ticketId);
    return JSON.parse(jsonStr);
  }

  @Post('test-retrieval/queries')
  async testGenerateQueries(@Body('ticketJson') ticketJson: any) {
    if (!ticketJson) {
      throw new BadRequestException('ticketJson body parameter is required');
    }
    const jsonStr = typeof ticketJson === 'string' ? ticketJson : JSON.stringify(ticketJson, null, 2);
    const queries = await this.retrievalService.generateSearchQueries(jsonStr);
    return { queries };
  }

  @Post('test-retrieval/search')
  async testExecuteHybridSearch(@Body('queries') queries: string[]) {
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      throw new BadRequestException('queries array body parameter is required and cannot be empty');
    }
    const chunks = await this.retrievalService.executeHybridSearch(queries);
    return {
      message: `Successfully executed hybrid search for ${queries.length} queries`,
      totalChunks: chunks.length,
      chunks,
    };
  }

  @Get('test-retrieval/workflow/:ticketId')
  async testRetrievalWorkflow(@Param('ticketId') ticketId: string) {
    const result = await this.retrievalService.getRelevantPoliciesForTicket(ticketId);
    
    // Parse the ticketContext string back to JSON so it renders nicely in Postman
    return {
      ...result,
      ticketContext: result.ticketContext ? JSON.parse(result.ticketContext) : null,
    };
  }
}
