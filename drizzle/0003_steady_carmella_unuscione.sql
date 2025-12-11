ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('cash','card','invoice','online') NOT NULL DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` enum('pending','processing','paid','failed','refunded') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentId` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentProvider` varchar(32);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentUrl` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `paidAt` timestamp;