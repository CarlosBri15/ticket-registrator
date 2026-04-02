import { HttpException, HttpStatus } from '@nestjs/common';

export class GeminiExtractionException extends HttpException {
  constructor(message = 'Failed to extract receipt data from image') {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
