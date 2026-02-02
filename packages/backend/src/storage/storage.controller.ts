import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':filename')
  async findFile(@Param('filename') fileName: string) {
    try{
      const url = await this.storageService.findFile(fileName);
      return {
        url: url,
        expiresIn: '15 minutes'
      };
    } catch (error){
      throw new NotFoundException('Image not found');
    }
  }

  @Delete(':filename')
  async removeFile(@Param('filename') fileName: string) {
    try{
      await this.storageService.removeFile(fileName);
      return {
        message: 'File removed',
        fileName: fileName
      }
    } catch (error) {
      if (error.message.includes('Not found')){
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException('Could not remove file');
    }
  }
}
