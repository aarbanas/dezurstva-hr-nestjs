import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DiscordService {
  constructor(private readonly configService: ConfigService) {}

  async sendQueueWebhook(content: string): Promise<void> {
    const discordRedriveQueueWebhookUrl = this.configService.getOrThrow(
      'DISCORD_QUEUE_WEBHOOK',
    );

    await axios.post(discordRedriveQueueWebhookUrl, {
      content,
    });
  }
}
