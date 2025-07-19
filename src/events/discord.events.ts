import { DiscordWebhookEmbed } from '../notification/discord/discord.service';

export class DiscordQueueEvent {
  constructor(public readonly content: string) {}
}

export class DiscordAdminInfoEvent {
  constructor(
    public readonly content: string,
    public readonly embeds: DiscordWebhookEmbed[],
  ) {}
}
