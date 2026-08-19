import { prisma } from "@sirius/database";

export async function getUserById(id: string) {
	return await prisma.user.findUnique({
		where: { id },
		include: { accounts: true },
	});
}

export async function updateUserProfile(
	userId: string,
	data: { name: string; image?: string | null },
) {
	return await prisma.user.update({
		where: { id: userId },
		data: {
			name: data.name.trim(),
			image:
				typeof data.image === "string" && data.image.trim().length > 0
					? data.image.trim()
					: null,
		},
	});
}
