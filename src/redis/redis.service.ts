import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.configService.getOrThrow('REDIS_URL'));
  }

  onModuleDestroy() {
    this.client.quit(); //
  }

  async set(key: string, otp: string, ttlInSeconds: number): Promise<void> {
    await this.client.set(key, otp, 'EX', ttlInSeconds); // 'EX' sets an expiration time
  }

  // Example of getting OTP from Redis
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // Example of deleting OTP (optional)
  async delete(key: string): Promise<number> {
    return this.client.del(key);
  }
}
