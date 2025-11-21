CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`fileName` text NOT NULL,
	`fileSize` integer NOT NULL,
	`content` text NOT NULL,
	`mimeType` text NOT NULL,
	`s3Key` text NOT NULL,
	`s3Url` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`confidence` integer NOT NULL,
	`sourceDocumentId` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `queries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`queryText` text NOT NULL,
	`result` text,
	`traversalPath` text,
	`executionTime` integer,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`sourceEntityId` integer NOT NULL,
	`targetEntityId` integer NOT NULL,
	`relationshipType` text NOT NULL,
	`confidence` integer NOT NULL,
	`sourceDocumentId` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` text NOT NULL,
	`name` text,
	`email` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_sessionId_unique` ON `users` (`sessionId`);