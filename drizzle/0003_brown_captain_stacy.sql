CREATE TABLE `net_worth_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_id` integer NOT NULL,
	`side` text NOT NULL,
	`category` text NOT NULL,
	`label` text NOT NULL,
	`amount` real NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `net_worth_snapshot`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `net_worth_snapshot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taken_at` integer NOT NULL,
	`note` text,
	`total` real DEFAULT 0 NOT NULL
);
