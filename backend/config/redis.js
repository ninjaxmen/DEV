import Redis from 'ioredis';

export function createRedisClient(redisUrl) {
  if (!redisUrl) {
    console.warn('REDIS_URL missing: cache disabled.');
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true
  });

  client.on('error', (error) => {
    console.error('Redis error:', error.message);
  });

  return client;
}
