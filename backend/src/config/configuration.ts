export type AppConfig = {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  corsOrigin: string;
  databaseUrl: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  sms: {
    userId: string;
    apiKey: string;
    senderId: string;
  };
};

const encode = (value: string): string => encodeURIComponent(value);

const buildMysqlUrl = (host: string, port: number, user: string, password: string, name: string): string =>
  `mysql://${encode(user)}:${encode(password)}@${host}:${port}/${name}`;

export const configFactory = (): AppConfig => {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const name = process.env.DB_NAME ?? 'salon';

  const databaseUrl =
    process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
      ? process.env.DATABASE_URL
      : buildMysqlUrl(host, port, user, password, name);

  return {
    nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    databaseUrl,
    database: { host, port, user, password, name },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    sms: {
      userId: process.env.SMS_USER_ID ?? '',
      apiKey: process.env.SMS_API_KEY ?? '',
      senderId: process.env.SMS_SENDER_ID ?? '',
    },
  };
};

export const configValidationSchema = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const hasUrl =
    typeof config.DATABASE_URL === 'string' &&
    String(config.DATABASE_URL).trim() !== '';

  const hasIndividualParts =
    typeof config.DB_HOST === 'string' &&
    String(config.DB_HOST).trim() !== '' &&
    typeof config.DB_NAME === 'string' &&
    String(config.DB_NAME).trim() !== '';

  if (!hasUrl && !hasIndividualParts) {
    throw new Error(
      `Missing database configuration. Set DATABASE_URL or the DB_HOST / DB_PORT / ` +
        `DB_USER / DB_PASSWORD / DB_NAME variables in backend/.env. ` +
        `See backend/.env.example for the expected format.`,
    );
  }

  return config;
};
