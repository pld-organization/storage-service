import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => {
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST || '127.0.0.1';
  const port = process.env.MONGODB_PORT || '27017';
  const database = process.env.MONGODB_DB || 'clinic_db';

  // Build connection string with auth if credentials exist
  const auth = username && password ? `${username}:${password}@` : '';
  const uri = process.env.MONGO_URI || `mongodb://${auth}${host}:${port}`;

  return {
    uri,
    host,
    port: parseInt(port, 10),
    database,
    username: username || '',
    password: password || '',
  };
});
