import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PoliciesService } from './policies.service';
import { IngestPolicyDto } from './dto/ingest-document.dto';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

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
}
