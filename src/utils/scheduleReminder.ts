import { prisma } from "@/database/prisma";

export default async function scheduleReminder(
	serverId: string,
	channelId: string,
	content: string,
	delay: number,
) {
	if (delay < 0) {
		throw new RangeError("Delay must be a non-negative number");
	}

	await prisma.reminder.create({
		data: {
			serverId,
			channelId,
			content,
			remindAt: new Date(Date.now() + delay),
		},
	});
}
