import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DB_CONNECTION = 'DB_CONNECTION';

const dbProvider = {
    provide: DB_CONNECTION,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string | undefined>('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined');
        }
        const queryClient = postgres(connectionString);
        return drizzle(queryClient, { schema });
    },
};

@Global()
@Module({
    imports: [ConfigModule],
    providers: [dbProvider],
    exports: [DB_CONNECTION],
})
export class DbModule { }
