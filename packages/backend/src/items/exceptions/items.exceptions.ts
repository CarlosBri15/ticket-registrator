import { HttpException, HttpStatus } from '@nestjs/common';

export class ItemNotFoundException extends HttpException {
  constructor(id?: string) {
    super(
      id ? `Item with id "${id}" not found` : 'Item not found',
      HttpStatus.NOT_FOUND,
    );
  }
}
