export const BASE_URL = "https://siriusbot.f5.si";
export const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "https://sirius-bot-zq4a.onrender.com";

export interface ApiCommandOption {
	type: number;
	name: string;
	description: string;
	required?: boolean;
	min_value?: number;
	max_value?: number;
	choices?: { name: string; value: string | number }[];
	options?: ApiCommandOption[]; // サブコマンド用（adminコマンドなどで使用）
	channel_types?: number[]; // ttsコマンドなどで使用
}

export interface ApiCommand {
	id: string;
	application_id: string;
	version: string;
	type: number;
	name: string;
	description: string;
	options?: ApiCommandOption[];
	dm_permission?: boolean;
	nsfw?: boolean;
	integration_types?: number[];
	default_member_permissions?: string | null;
}
