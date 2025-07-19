import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type DiscordWebhookEmbed = {
  title: string;
  url: string;
  color: number;
};

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

  async sendAdminInfoWebhook(
    content: string,
    embeds: DiscordWebhookEmbed[],
  ): Promise<void> {
    const discordRedriveQueueWebhookUrl = this.configService.getOrThrow(
      'DISCORD_ADMIN_INFO_WEBHOOK',
    );

    await axios.post(discordRedriveQueueWebhookUrl, {
      content,
      embeds,
    });
  }
}
