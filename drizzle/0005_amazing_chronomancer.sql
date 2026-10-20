CREATE TABLE `fire_milestone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`kind` text NOT NULL,
	`value` real NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`monthly_spend` real DEFAULT 0 NOT NULL
);
