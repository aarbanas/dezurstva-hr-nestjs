import { Injectable } from '@nestjs/common';
import { DiscordService } from '../notification/discord/discord.service';
import { OnEvent } from '@nestjs/event-emitter';
import { DiscordQueueEvent } from '../events/discord.events';

@Injectable()
export class DiscordListener {
  constructor(private readonly discordService: DiscordService) {}

  @OnEvent('discord.queue')
  async handleDiscordQueueEvent(event: DiscordQueueEvent): Promise<void> {
    const { content } = event;

    await this.discordService.sendQueueWebhook(content);
  }
}
