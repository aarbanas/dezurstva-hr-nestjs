import { Injectable } from '@nestjs/common';
import { DiscordService } from '../notification/discord/discord.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DiscordAdminInfoEvent,
  DiscordQueueEvent,
} from '../events/discord.events';

@Injectable()
export class DiscordListener {
  constructor(private readonly discordService: DiscordService) {}

  @OnEvent('discord.queue')
  async handleDiscordQueueEvent(event: DiscordQueueEvent): Promise<void> {
    const { content } = event;

    await this.discordService.sendQueueWebhook(content);
  }

  @OnEvent('discord.admin.info')
  async handleDiscordAdminInfoEvent(
    event: DiscordAdminInfoEvent,
  ): Promise<void> {
    const { content, embeds } = event;

    await this.discordService.sendAdminInfoWebhook(content, embeds);
  }
}
