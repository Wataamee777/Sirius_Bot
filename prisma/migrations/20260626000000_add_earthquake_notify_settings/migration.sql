-- AlterTable
ALTER TABLE `ServerSetting` ADD COLUMN `earthquakeNotifyEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `ServerSetting` ADD COLUMN `earthquakeChannelId` VARCHAR(191) NULL;
ALTER TABLE `ServerSetting` ADD COLUMN `earthquakeWebhookUrl` TEXT NULL;
