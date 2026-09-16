import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export type Database = ReturnType<typeof drizzle>;

export const NeonDBProvider = {
  provide: 'NeonDBProvider',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const sql = neon(configService.get<string>('NEON_DB_URL')!);

    return drizzle({ client: sql });
  },
};
