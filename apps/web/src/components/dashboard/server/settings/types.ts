export type MetadataItem = {
	id: string;
	name: string;
};

export type GuildMetadata = {
	channels: MetadataItem[];
	roles: MetadataItem[];
};

export type AutoReaction = {
	channelId: string;
	emoji: string;
};

export type GuildSettings = {
	spamBlockEnabled: boolean;
	inviteBlockEnabled: boolean;
	shortBlockEnabled: boolean;
	regexBlockEnabled: boolean;

	spamReportChannelId: string;
	inviteReportChannelId: string;
	shortReportChannelId: string;
	regexReportChannelId: string;

	spamIgnoredRoles: string;
	spamIgnoredChannels: string;

	inviteIgnoredRoles: string;
	inviteIgnoredChannels: string;

	shortIgnoredRoles: string;
	shortIgnoredChannels: string;

	regexIgnoredRoles: string;
	regexIgnoredChannels: string;

	honeypotEnabled: boolean;
	honeypotChannelId: string;
	honeypotReportId: string;
	honeypotIgnoreRole: string;

	autoReactions: AutoReaction[];

	earthquakeNotifyEnabled: boolean;
	earthquakeChannelId: string;
	earthquakeNotifyRoles: string;
	earthquakeNotifyScale: number;
	joinLeaveNotificationEnabled: boolean;
	mentionReadoutEnabled: boolean;
	mentionReadoutNameOnly: boolean;
	mentionReadoutVolume: number;
	regexPatterns: string;
	dataRetentionEnabled: boolean;
};
