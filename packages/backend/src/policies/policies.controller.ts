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
      throw new BadRequestException(
        'No file uploaded. Please upload a file using the "file" form-data field.',
      );
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
}
