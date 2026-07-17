import { prisma } from "@/database/prisma";

export default async function scheduleReminder(
	serverId: string,
	channelId: string,
	delay: number,
) {
	if (delay < 0) {
		throw new RangeError("Delay must be a non-negative number");
	}

	await prisma.bumpReminder.create({
		data: {
			serverId,
			channelId,
			remindAt: new Date(Date.now() + delay),
		},
	});
}
