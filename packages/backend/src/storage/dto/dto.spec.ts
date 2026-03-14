import { CreateStorageDto } from './create-storage.dto';
import { UpdateStorageDto } from './update-storage.dto';

describe('Storage DTOs', () => {
  it('should instantiate CreateStorageDto', () => {
    const dto = new CreateStorageDto();
    expect(dto).toBeDefined();
  });

  it('should instantiate UpdateStorageDto', () => {
    const dto = new UpdateStorageDto();
    expect(dto).toBeDefined();
  });
});
