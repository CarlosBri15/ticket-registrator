import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('extract-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async extractReceipt(@UploadedFile() file: Express.Multer.File) {
    console.log("POST /gemini/extract-receipt called");
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Convert image buffer to base64
    const imageBase64 = file.buffer.toString('base64');
    console.log("Image size:", imageBase64.length)

    return this.geminiService.extractReceipt(imageBase64);
  }
}
