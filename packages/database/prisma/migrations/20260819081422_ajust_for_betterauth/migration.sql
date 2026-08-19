/*
  Warnings:

  - You are about to alter the column `accountId` on the `account` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[issuer,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issuer` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account` ADD COLUMN `issuer` VARCHAR(191) NOT NULL,
    MODIFY `accountId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `server_settings` ADD COLUMN `earthquakeNotifyRole` TEXT NULL,
    ADD COLUMN `earthquakeNotifyScale` INTEGER NULL,
    ADD COLUMN `joinLeaveNotificationEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mentionReadoutEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mentionReadoutNameOnly` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mentionReadoutVolume` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `regexBlockEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `regexIgnoredChannels` TEXT NULL,
    ADD COLUMN `regexIgnoredRoles` TEXT NULL,
    ADD COLUMN `regexPatterns` VARCHAR(191) NULL,
    ADD COLUMN `regexReportChannelId` VARCHAR(191) NULL,
    ADD COLUMN `shortBlockEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `shortIgnoredChannels` TEXT NULL,
    ADD COLUMN `shortIgnoredRoles` TEXT NULL,
    ADD COLUMN `shortReportChannelId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `economy_affiliation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `economy_account` (
    `id` VARCHAR(255) NOT NULL,
    `discordId` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NULL,
    `affiliationName` VARCHAR(255) NOT NULL DEFAULT '未所属',
    `affiliationId` VARCHAR(255) NULL,
    `coins` BIGINT NOT NULL DEFAULT 0,
    `intelligenceLevel` INTEGER NOT NULL DEFAULT 0,
    `satiation` INTEGER NOT NULL DEFAULT 80,
    `happiness` INTEGER NOT NULL DEFAULT 70,
    `birthday` DATETIME(3) NULL,
    `lastWorkAt` DATETIME(3) NULL,
    `inventory` TEXT NULL,
    `lastBirthdayBonusYear` INTEGER NULL,
    `lastSchoolAt` DATETIME(3) NULL,
    `schoolAttendanceCount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT '健康',
    `ipAddress` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `economy_account_discordId_key`(`discordId`),
    INDEX `economy_account_affiliationId_idx`(`affiliationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `economy_log` (
    `id` VARCHAR(255) NOT NULL,
    `discordId` VARCHAR(255) NOT NULL,
    `accountId` VARCHAR(255) NULL,
    `eventType` VARCHAR(50) NOT NULL,
    `amount` BIGINT NOT NULL DEFAULT 0,
    `balanceBefore` BIGINT NOT NULL DEFAULT 0,
    `balanceAfter` BIGINT NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `economy_log_discordId_idx`(`discordId`),
    INDEX `economy_log_eventType_idx`(`eventType`),
    INDEX `economy_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `race_history` (
    `id` VARCHAR(255) NOT NULL,
    `discordId` VARCHAR(255) NOT NULL,
    `selectedHorseIndex` INTEGER NOT NULL,
    `selectedHorseName` VARCHAR(255) NOT NULL,
    `betType` VARCHAR(10) NOT NULL,
    `betAmount` BIGINT NOT NULL,
    `odds` DECIMAL(10, 2) NOT NULL,
    `isHit` BOOLEAN NOT NULL,
    `payout` BIGINT NOT NULL,
    `balanceBefore` BIGINT NOT NULL,
    `balanceAfter` BIGINT NOT NULL,
    `raceResult` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `economyAccountId` VARCHAR(255) NULL,

    INDEX `race_history_discordId_idx`(`discordId`),
    INDEX `race_history_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `account_userId_idx` ON `account`(`userId`(191));

-- CreateIndex
CREATE UNIQUE INDEX `account_issuer_accountId_uidx` ON `account`(`issuer`, `accountId`);

-- CreateIndex
CREATE INDEX `session_userId_idx` ON `session`(`userId`(191));

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- AddForeignKey
ALTER TABLE `economy_account` ADD CONSTRAINT `economy_account_affiliationId_fkey` FOREIGN KEY (`affiliationId`) REFERENCES `economy_affiliation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `economy_log` ADD CONSTRAINT `economy_log_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `economy_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_history` ADD CONSTRAINT `race_history_economyAccountId_fkey` FOREIGN KEY (`economyAccountId`) REFERENCES `economy_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
