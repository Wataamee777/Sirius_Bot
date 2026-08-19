-- AlterTable
ALTER TABLE `server_settings`
ADD COLUMN `earthquakeNotifyEnabled` BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE `server_settings`
ADD COLUMN `earthquakeChannelId` VARCHAR(191) NULL;

ALTER TABLE `server_settings`
ADD COLUMN `earthquakeWebhookUrl` TEXT NULL;