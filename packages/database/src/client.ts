import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const requiredEnv = [
	"DATABASE_HOST",
	"DATABASE_PORT",
	"DATABASE_USER",
	"DATABASE_PASSWORD",
	"DATABASE_NAME",
] as const;

for (const key of requiredEnv) {
	if (!process.env[key]) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
}

const port = Number(process.env.DATABASE_PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error(`Invalid DATABASE_PORT: ${process.env.DATABASE_PORT}`);
}

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST,
	port,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	connectionLimit: 5,
});

const prismaClientSingleton = (): PrismaClient => {
	return new PrismaClient({
		adapter,
	});
};

declare global {
	var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma: PrismaClient =
	globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
	globalThis.prismaGlobal = prisma;
}
