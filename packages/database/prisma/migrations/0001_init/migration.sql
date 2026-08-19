-- CreateTable
CREATE TABLE
    `server_settings` (
        `id` VARCHAR(191) NOT NULL,
        `serverId` VARCHAR(191) NOT NULL,
        `spamBlockEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
        `inviteBlockEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
        `spamReportChannelId` VARCHAR(191) NULL,
        `inviteReportChannelId` VARCHAR(191) NULL,
        `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME (3) NOT NULL,
        `ignoredChannels` TEXT NULL,
        `ignoredRoles` TEXT NULL,
        `spamIgnoredRoles` TEXT NULL,
        `spamIgnoredChannels` TEXT NULL,
        `inviteIgnoredRoles` TEXT NULL,
        `inviteIgnoredChannels` TEXT NULL,
        `honeypotChannelId` VARCHAR(191) NULL,
        `honeypotEnabled` BOOLEAN NOT NULL DEFAULT FALSE,
        `honeypotIgnoreRole` TEXT NULL,
        `honeypotReportId` VARCHAR(191) NULL,
        `autoReactions` TEXT NULL,
        UNIQUE INDEX `server_settings_serverId_key` (`serverId`),
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
    `account` (
        `id` VARCHAR(255) NOT NULL,
        `userId` VARCHAR(255) NOT NULL,
        `providerId` VARCHAR(255) NOT NULL,
        `accountId` VARCHAR(255) NOT NULL,
        `accessToken` TEXT NULL,
        `refreshToken` TEXT NULL,
        `expiresAt` DATETIME (0) NULL,
        `password` TEXT NULL,
        `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME (3) NOT NULL,
        `idToken` TEXT NULL,
        `accessTokenExpiresAt` DATETIME (3) NULL,
        `refreshTokenExpiresAt` DATETIME (3) NULL,
        `scope` TEXT NULL,
        INDEX `account_userId_fkey` (`userId`),
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
    `session` (
        `id` VARCHAR(255) NOT NULL,
        `userId` VARCHAR(255) NOT NULL,
        `token` VARCHAR(255) NOT NULL,
        `expiresAt` DATETIME (3) NOT NULL,
        `ipAddress` VARCHAR(255) NULL,
        `userAgent` VARCHAR(255) NULL,
        `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME (3) NOT NULL,
        UNIQUE INDEX `session_token_key` (`token`),
        INDEX `session_userId_fkey` (`userId`),
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
    `user` (
        `id` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL,
        `emailVerified` BOOLEAN NOT NULL,
        `image` VARCHAR(255) NULL,
        `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME (3) NOT NULL,
        UNIQUE INDEX `user_email_key` (`email`),
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
    `users` (
        `id` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `image` VARCHAR(255) NULL,
        `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `acceptedPrivacy` BOOLEAN NOT NULL DEFAULT FALSE,
        `acceptedTerms` BOOLEAN NOT NULL DEFAULT FALSE,
        `birthday` DATETIME (3) NULL,
        `economyRegistered` BOOLEAN NOT NULL DEFAULT FALSE,
        `ipAddress` VARCHAR(255) NULL,
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
    `verification` (
        `id` VARCHAR(255) NOT NULL,
        `identifier` VARCHAR(255) NOT NULL,
        `value` TEXT NOT NULL,
        `expiresAt` DATETIME (3) NOT NULL,
        `createdAt` DATETIME (3) NULL,
        `updatedAt` DATETIME (3) NULL,
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
    `SurvivalRanking` (
        `userId` VARCHAR(191) NOT NULL,
        `username` VARCHAR(191) NOT NULL,
        `bestDays` INTEGER NOT NULL DEFAULT 0,
        `updatedAt` DATETIME (3) NOT NULL,
        PRIMARY KEY (`userId`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;