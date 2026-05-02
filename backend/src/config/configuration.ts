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

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getRequiredNumberEnv = (key: string): number => {
  const value = Number(getRequiredEnv(key));
  if (Number.isNaN(value)) {
    throw new Error(`Invalid number environment variable: ${key}`);
  }
  return value;
};

export const configFactory = (): AppConfig => {
  const host = getRequiredEnv('DB_HOST');
  const port = getRequiredNumberEnv('DB_PORT');
  const user = getRequiredEnv('DB_USER');
  const password = getRequiredEnv('DB_PASSWORD');
  const name = getRequiredEnv('DB_NAME');
  const databaseUrl = getRequiredEnv('DATABASE_URL');

  return {
    nodeEnv: getRequiredEnv('NODE_ENV') as AppConfig['nodeEnv'],
    port: getRequiredNumberEnv('PORT'),
    corsOrigin: getRequiredEnv('CORS_ORIGIN'),
    databaseUrl,
    database: { host, port, user, password, name },
    jwt: {
      accessSecret: getRequiredEnv('JWT_ACCESS_SECRET'),
      refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
      accessExpiresIn: getRequiredEnv('JWT_ACCESS_EXPIRES_IN'),
      refreshExpiresIn: getRequiredEnv('JWT_REFRESH_EXPIRES_IN'),
    },
    sms: {
      userId: getRequiredEnv('SMS_USER_ID'),
      apiKey: getRequiredEnv('SMS_API_KEY'),
      senderId: getRequiredEnv('SMS_SENDER_ID'),
    },
  };
};

export const configValidationSchema = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  return config;
};
