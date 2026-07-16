import type { Message } from "discord.js";
import { Events } from "discord.js";
import convertToCombinedText from "../utils/convertToCombinedText";
import scheduleReminder from "../utils/scheduleReminder";

const REMINDER_INTERVAL = 2 * 60 * 60 * 1000;
const DISBOARD_BOT_ID = "1300797373374529557";

function isBumpMessage(message: Message) {
	if (!message.inGuild()) return false;
	if (!message.author.bot || message.author.id !== DISBOARD_BOT_ID)
		return false;
	if (!message.interactionMetadata) return false;
	const txt = convertToCombinedText(message);
	return (
    txt.includes("合計bump:") &&
		txt.includes("表示順を上げました。[こちら](https://distopia.top/)で確認できます。")
	);
}

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (!isBumpMessage(message)) return;

		await message.reply("BUMPを検知しました\n1時間後に通知します");
		scheduleReminder(
			message.channel,
			"前回のDISTOPIAのBUMPから1時間が経過しました\n</bump:1309070135360749620> を再度実行できます",
			REMINDER_INTERVAL,
		);
	},
};
