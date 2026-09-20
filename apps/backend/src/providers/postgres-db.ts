import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from 'src/schema';

export const NeonDBProvider = {
  provide: 'NeonDBProvider',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const sql = neon(configService.get<string>('NEON_DB_URL')!);

    return drizzle(sql, {
      schema,
    });
  },
};

export type Database = ReturnType<(typeof NeonDBProvider)['useFactory']>;
