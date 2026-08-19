export type AutoReaction = {
	channelId: string;
	emoji: string;
};

export function normalizeAutoReactions(value: unknown): AutoReaction[] {
	if (Array.isArray(value)) {
		return value.filter(
			(item): item is AutoReaction =>
				typeof item === "object" &&
				item !== null &&
				typeof (item as { channelId?: unknown }).channelId === "string" &&
				typeof (item as { emoji?: unknown }).emoji === "string",
		);
	}

	if (typeof value === "string") {
		try {
			return normalizeAutoReactions(JSON.parse(value));
		} catch {
			return [];
		}
	}

	return [];
}
