import { createZodDto } from 'nestjs-zod';
import { ingestPolicySchema } from '@ticket-registrator/shared';

export class IngestPolicyDto extends createZodDto(ingestPolicySchema) {}

