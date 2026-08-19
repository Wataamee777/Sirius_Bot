"use server";

import { type Prisma, prisma } from "@sirius/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	getDiscordAccountForSession,
	getEconomyAccountByDiscordId,
} from "@/lib/economy";
import { FIXED_AFFILIATION_NAMES } from "@/lib/economy-constants";
import { logEconomyEvent } from "@/lib/economy-logger";

type CreateEconomyAccountState = {
	error?: string;
	success?: boolean;
} | null;

async function checkVPN(ipAddress: string): Promise<boolean> {
	try {
		const response = await fetch(
			`https://ipqualityscore.com/api/json/ip/reputation?ip=${ipAddress}&strictness=1&allow_public_access=true`,
			{ signal: AbortSignal.timeout(5000) },
		);
		const data = await response.json();
		return data.is_vpn === true;
	} catch {
		return false;
	}
}

function getClientIpAddress(headers: {
	get: (key: string) => string | null;
}): string {
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	return headers.get("x-real-ip") || "unknown";
}

// 生年月日のパースおよび年齢の算出
function parseBirthdate(value: FormDataEntryValue | null): {
	birthday: Date;
	age: number;
} {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error("生年月日を入力してください。");
	}

	const birthday = new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(birthday.getTime())) {
		throw new Error("生年月日が不正です。");
	}

	const today = new Date();
	let age = today.getUTCFullYear() - birthday.getUTCFullYear();
	const birthdayThisYear = new Date(
		Date.UTC(
			today.getUTCFullYear(),
			birthday.getUTCMonth(),
			birthday.getUTCDate(),
		),
	);

	if (today < birthdayThisYear) {
		age -= 1;
	}

	// 13歳未満は作成不可
	if (age < 13) {
		throw new Error("13歳未満は経済アカウントを作成できません。");
	}

	return { birthday, age };
}

export async function createEconomyAccount(
	_prevState: CreateEconomyAccountState,
	formData: FormData,
): Promise<CreateEconomyAccountState> {
	try {
		const authData = await getDiscordAccountForSession();
		if (!authData) {
			return { error: "ログインが必要です。" };
		}

		const { discordId, user } = authData;

		const existing = await getEconomyAccountByDiscordId(discordId);
		if (existing) {
			redirect("/economy");
		}

		const affiliationName = formData.get("affiliationName");
		const acceptedTerms = formData.get("acceptedTerms");
		const acceptedPrivacy = formData.get("acceptedPrivacy");
		const acceptedParentalConsent = formData.get("acceptedParentalConsent");

		if (
			typeof affiliationName !== "string" ||
			!FIXED_AFFILIATION_NAMES.includes(
				affiliationName as (typeof FIXED_AFFILIATION_NAMES)[number],
			)
		) {
			return { error: "所属を選択してください。" };
		}

		if (!acceptedTerms || !acceptedPrivacy) {
			return { error: "利用規約とプライバシーポリシーに同意してください。" };
		}

		// 生年月日と年齢の算出
		const { birthday, age } = parseBirthdate(formData.get("birthdate"));

		// 16歳未満の場合は親権者同意チェックの存在を検証（DB保存はしない）
		if (age < 16 && !acceptedParentalConsent) {
			return { error: "16歳未満の方は親権者の同意が必要です。" };
		}

		const headersObj = await headers();
		const clientIp = getClientIpAddress(headersObj);

		// VPN検証
		const isVpn = await checkVPN(clientIp);
		if (isVpn) {
			return { error: "VPNの使用は禁止されています。" };
		}

		// 重複IPチェック
		const existingAccountWithIP = await prisma.economyAccount.findFirst({
			where: { ipAddress: clientIp },
		});

		if (existingAccountWithIP) {
			return {
				error:
					"このIPアドレスからは既にアカウントが作成されています。異なるIPアドレスから再度お試しください。",
			};
		}

		const fixedAffiliationIndex = FIXED_AFFILIATION_NAMES.indexOf(
			affiliationName as (typeof FIXED_AFFILIATION_NAMES)[number],
		);

		const existingAffiliation = await prisma.economyAffiliation.findFirst({
			where: { name: affiliationName },
		});

		const affiliation = existingAffiliation
			? await prisma.economyAffiliation.update({
					where: { id: existingAffiliation.id },
					data: { enabled: true, sortOrder: fixedAffiliationIndex },
				})
			: await prisma.economyAffiliation.create({
					data: {
						name: affiliationName,
						enabled: true,
						sortOrder: fixedAffiliationIndex,
					},
				});

		const registrationBonus = 30000;
		const baseCoins = 50000;
		const totalCoins = baseCoins + registrationBonus;

		// DBへの登録処理
		const createdAccount = await prisma.economyAccount.create({
			data: {
				discordId,
				name: user.name ?? "Unknown",
				image: user.image ?? null,
				affiliationName,
				affiliationId: affiliation.id,
				intelligenceLevel: 0,
				coins: totalCoins,
				satiation: 100,
				happiness: 100,
				inventory: "{}",
				ipAddress: clientIp,
				status: "健康",
				birthday,
			},
		});

		await logEconomyEvent({
			discordId,
			accountId: createdAccount.id,
			eventType: "account_create",
			amount: BigInt(totalCoins),
			balanceBefore: 0n,
			balanceAfter: BigInt(totalCoins),
			description: "経済アカウント作成",
			metadata: {
				registrationBonus,
				baseCoins,
				affiliationName,
			},
		});

		revalidatePath("/economy");
		redirect("/economy");
	} catch (error) {
		if (
			typeof error === "object" &&
			error !== null &&
			"digest" in error &&
			typeof error.digest === "string" &&
			error.digest.startsWith("NEXT_REDIRECT")
		) {
			throw error;
		}

		console.error("[createEconomyAccount Error]", error);

		if (error instanceof Error) {
			return { error: error.message };
		}

		return { error: "アカウント作成中にエラーが発生しました。" };
	}
}

/**
 * 管理者用: 経済アカウントを検索
 */
export async function searchEconomyAccounts(query: string) {
	try {
		const authData = await getDiscordAccountForSession();
		if (!authData) {
			return { error: "ログインが必要です。", accounts: [] };
		}

		// 管理者チェック
		const ECONOMY_ADMIN_DISCORD_ID = "1275233053601435703";
		if (authData.discordId !== ECONOMY_ADMIN_DISCORD_ID) {
			return { error: "管理者のみがアクセス可能です。", accounts: [] };
		}

		if (!query || query.trim().length === 0) {
			return { accounts: [] };
		}

		const rawAccounts = await prisma.economyAccount.findMany({
			where: {
				OR: [{ name: { contains: query } }, { discordId: { contains: query } }],
			},
			select: {
				id: true,
				name: true,
				discordId: true,
				coins: true,
				affiliationName: true,
			},
			take: 20,
		});

		// Client Component 渡すため coins (bigint) を string に変換
		const accounts: Array<{
			id: string;
			name: string;
			discordId: string;
			coins: string;
			affiliationName: string;
		}> = rawAccounts.map(
			(account: {
				id: string;
				name: string;
				discordId: string;
				coins: bigint | string | number;
				affiliationName: string;
			}) => ({
				...account,
				coins: String(account.coins ?? 0),
			}),
		);

		return { accounts };
	} catch (error) {
		console.error("[searchEconomyAccounts Error]", error);
		return { error: "検索中にエラーが発生しました。", accounts: [] };
	}
}

/**
 * 管理者用: 経済アカウント詳細を取得
 */
export async function getEconomyAccountDetail(accountId: string) {
	try {
		const authData = await getDiscordAccountForSession();
		if (!authData) {
			return { error: "ログインが必要です。" };
		}

		// 管理者チェック
		const ECONOMY_ADMIN_DISCORD_ID = "1275233053601435703";
		if (authData.discordId !== ECONOMY_ADMIN_DISCORD_ID) {
			return { error: "管理者のみがアクセス可能です。" };
		}

		const account = await prisma.economyAccount.findUnique({
			where: { id: accountId },
			include: {
				affiliation: true,
			},
		});

		if (!account) {
			return { error: "アカウントが見つかりません。" };
		}

		// Client Component に渡すため coins (bigint) を string に変換し、
		// 画面側で必須な affiliationName / affiliationId も明示的に保持する
		return {
			account: {
				id: account.id,
				name: account.name,
				discordId: account.discordId,
				image: account.image,
				coins: account.coins.toString(),
				affiliationName: account.affiliationName,
				affiliationId: account.affiliationId,
				affiliation: account.affiliation,
				satiation: account.satiation,
				happiness: account.happiness,
				intelligenceLevel: account.intelligenceLevel,
				status: account.status,
				createdAt: account.createdAt,
				updatedAt: account.updatedAt,
				birthday: account.birthday,
				lastWorkAt: account.lastWorkAt,
				lastBirthdayBonusYear: account.lastBirthdayBonusYear,
				lastSchoolAt: account.lastSchoolAt,
				schoolAttendanceCount: account.schoolAttendanceCount,
				inventory: account.inventory,
				ipAddress: account.ipAddress,
			},
		};
	} catch (error) {
		console.error("[getEconomyAccountDetail Error]", error);
		return { error: "詳細情報取得中にエラーが発生しました。" };
	}
}

type UpdateEconomyAccountState = {
	error?: string;
	success?: boolean;
} | null;

/**
 * 管理者用: 経済アカウント情報を更新
 */
export async function updateEconomyAccountAsAdmin(
	accountId: string,
	_prevState: UpdateEconomyAccountState,
	formData: FormData,
): Promise<UpdateEconomyAccountState> {
	try {
		const authData = await getDiscordAccountForSession();
		if (!authData) {
			return { error: "ログインが必要です。" };
		}

		// 管理者チェック
		const ECONOMY_ADMIN_DISCORD_ID = "1275233053601435703";
		if (authData.discordId !== ECONOMY_ADMIN_DISCORD_ID) {
			return { error: "管理者のみがアクセス可能です。" };
		}

		const account = await prisma.economyAccount.findUnique({
			where: { id: accountId },
		});

		if (!account) {
			return { error: "アカウントが見つかりません。" };
		}

		// フォームデータから値を取得
		const coinsStr = formData.get("coins");
		const satiation = formData.get("satiation");
		const happiness = formData.get("happiness");
		const intelligenceLevel = formData.get("intelligenceLevel");
		const affiliationName = formData.get("affiliationName");
		const status = formData.get("status");

		// コイン数 バリデーション & パース
		let parsedCoins = account.coins ?? 0;
		if (coinsStr && typeof coinsStr === "string") {
			const num = parseInt(coinsStr.trim(), 10);
			if (Number.isNaN(num) || num < 0) {
				return { error: "有効なコイン数を入力してください。" };
			}
			parsedCoins = BigInt(num);
		}

		const parsedSatiation = satiation
			? Math.max(0, Math.min(100, parseInt(satiation as string, 10)))
			: account.satiation;
		const parsedHappiness = happiness
			? Math.max(0, Math.min(100, parseInt(happiness as string, 10)))
			: account.happiness;
		const parsedIntelligenceLevel = intelligenceLevel
			? Math.max(0, parseInt(intelligenceLevel as string, 10))
			: account.intelligenceLevel;
		const parsedStatus = (status as string) || account.status;

		// affiliationId を取得
		let affiliationId: string | null = account.affiliationId;
		const rawAffiliationName =
			typeof affiliationName === "string" ? affiliationName.trim() : "";
		const newAffiliationName = rawAffiliationName || account.affiliationName;

		if (newAffiliationName !== account.affiliationName) {
			const affiliation = await prisma.economyAffiliation.findFirst({
				where: { name: newAffiliationName },
			});

			if (affiliation) {
				affiliationId = affiliation.id;
			} else if (
				FIXED_AFFILIATION_NAMES.includes(
					newAffiliationName as (typeof FIXED_AFFILIATION_NAMES)[number],
				)
			) {
				const newAffiliation = await prisma.economyAffiliation.create({
					data: {
						name: newAffiliationName,
						enabled: true,
						sortOrder: FIXED_AFFILIATION_NAMES.indexOf(
							newAffiliationName as (typeof FIXED_AFFILIATION_NAMES)[number],
						),
					},
				});
				affiliationId = newAffiliation.id;
			} else {
				return { error: "無効な所属グループです。" };
			}
		}

		const updateData: Prisma.EconomyAccountUpdateInput = {
			coins: parsedCoins,
			satiation: parsedSatiation,
			happiness: parsedHappiness,
			intelligenceLevel: parsedIntelligenceLevel,
			affiliationName: newAffiliationName,
			affiliation: affiliationId
				? { connect: { id: affiliationId } }
				: { disconnect: true },
			status: parsedStatus,
		};

		const beforeCoins = account.coins;
		const afterCoins = parsedCoins;

		await prisma.economyAccount.update({
			where: { id: accountId },
			data: updateData,
		});

		const coinDelta = afterCoins - beforeCoins;
		if (coinDelta.toString() !== "0") {
			await logEconomyEvent({
				discordId: account.discordId,
				accountId: account.id,
				eventType: "admin_adjustment",
				amount: BigInt(coinDelta),
				balanceBefore: BigInt(beforeCoins),
				balanceAfter: BigInt(afterCoins),
				description: "管理者による残高調整",
				metadata: {
					changedFields: Object.keys(updateData),
				},
			});
		}

		revalidatePath("/economy/admin");
		return { success: true };
	} catch (error) {
		console.error("[updateEconomyAccountAsAdmin Error]", error);

		if (error instanceof Error) {
			return { error: error.message };
		}

		return { error: "アカウント更新中にエラーが発生しました。" };
	}
}
