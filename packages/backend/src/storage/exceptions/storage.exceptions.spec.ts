import {
  StorageFileNotFoundException,
  StorageUploadException,
  StorageRemoveException,
} from './storage.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Storage Exceptions', () => {
  describe('StorageFileNotFoundException', () => {
    it('should include filename when provided', () => {
      const ex = new StorageFileNotFoundException('file.jpg');
      expect(ex.message).toContain('file.jpg');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should use generic message when no filename', () => {
      const ex = new StorageFileNotFoundException();
      expect(ex.message).toBe('File not found in storage');
    });
  });

  describe('StorageUploadException', () => {
    it('should use default message', () => {
      const ex = new StorageUploadException();
      expect(ex.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should use custom message', () => {
      const ex = new StorageUploadException('Upload failed badly');
      expect(ex.message).toBe('Upload failed badly');
    });
  });

  describe('StorageRemoveException', () => {
    it('should use default message', () => {
      const ex = new StorageRemoveException();
      expect(ex.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should use custom message', () => {
      const ex = new StorageRemoveException('Remove failed');
      expect(ex.message).toBe('Remove failed');
    });
  });
});
