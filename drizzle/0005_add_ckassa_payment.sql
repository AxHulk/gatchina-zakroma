ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('cash','card','invoice','online','ckassa') NOT NULL DEFAULT 'cash';
