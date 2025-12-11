CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productTitle` varchar(255) NOT NULL,
	`productSku` varchar(32) NOT NULL,
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(16) DEFAULT 'KGM',
	`subtotal` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`deliveryMethod` enum('pickup','delivery') NOT NULL DEFAULT 'delivery',
	`deliveryAddress` text,
	`deliveryCity` varchar(128),
	`deliveryComment` text,
	`paymentMethod` enum('cash','card','invoice') NOT NULL DEFAULT 'cash',
	`subtotal` int NOT NULL DEFAULT 0,
	`deliveryFee` int NOT NULL DEFAULT 0,
	`total` int NOT NULL DEFAULT 0,
	`status` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
