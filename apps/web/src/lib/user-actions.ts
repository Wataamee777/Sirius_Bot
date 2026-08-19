"use server";

import { prisma } from "@sirius/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function saveUserProfile(formData: FormData) {
	const requestHeaders = await headers();

	// 1. 先に認証チェックを行う（不要な処理をスキップするため）
	const session = await auth.api.getSession({
		headers: Object.fromEntries(requestHeaders.entries()),
	});
	if (!session?.user) {
		throw new Error("ログインが必要です。");
	}

	// 2. フォームデータの取得とバリデーション
	const name = formData.get("name");
	const image = formData.get("image");

	if (typeof name !== "string" || name.trim().length === 0) {
		throw new Error("表示名を入力してください。");
	}

	// 3. データベースの更新
	await prisma.user.update({
		where: { id: session.user.id },
		data: {
			name: name.trim(),
			image:
				typeof image === "string" && image.trim().length > 0
					? image.trim()
					: null,
		},
	});

	// 5. キャッシュの再検証
	revalidatePath("/dashboard");
	revalidatePath("/dashboard/edit");
}

export async function createEconomyAccount(_formData: FormData) {
	// 旧 mypage フローからの互換。新フローは economy-actions.ts を使用。
	redirect("/economy/create");
}
