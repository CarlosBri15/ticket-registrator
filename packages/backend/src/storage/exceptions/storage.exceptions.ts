import { HttpException, HttpStatus } from '@nestjs/common';

export class StorageFileNotFoundException extends HttpException {
  constructor(fileName?: string) {
    super(
      fileName
        ? `File "${fileName}" not found in storage`
        : 'File not found in storage',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class StorageUploadException extends HttpException {
  constructor(message = 'Failed to upload file to storage') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class StorageRemoveException extends HttpException {
  constructor(message = 'Failed to remove file from storage') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
