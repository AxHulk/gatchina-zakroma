CREATE TABLE `request_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `method` varchar(10) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `path` varchar(512) NOT NULL,
  `statusCode` int DEFAULT NULL,
  `requestHeaders` text,
  `requestBody` text,
  `responseBody` text,
  `ip` varchar(64),
  `userAgent` varchar(512),
  `source` varchar(64) NOT NULL DEFAULT 'general',
  `duration` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `request_logs_id` PRIMARY KEY(`id`)
);

CREATE INDEX `request_logs_timestamp_idx` ON `request_logs` (`timestamp`);
CREATE INDEX `request_logs_source_idx` ON `request_logs` (`source`);
CREATE INDEX `request_logs_path_idx` ON `request_logs` (`path`);
