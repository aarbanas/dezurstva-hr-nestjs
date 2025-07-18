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
    this.client.quit();
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  async append(key: string, value: string): Promise<void> {
    await this.client.rpush(key, value);
  }

  async getListLength(key: string): Promise<number> {
    return this.client.llen(key);
  }

  async removeItemFromList(
    key: string,
    count: number,
    value: string,
  ): Promise<number> {
    return this.client.lrem(key, count, value);
  }

  async getFromList(
    key: string,
    start = 0,
    stop = -1,
  ): Promise<string[] | null> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
