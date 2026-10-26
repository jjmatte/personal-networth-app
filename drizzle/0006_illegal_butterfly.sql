CREATE TABLE `income_person_year` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`name` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `income_year` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`estimated_income` real DEFAULT 0 NOT NULL,
	`investment_income` real DEFAULT 0 NOT NULL,
	`net_monthly_margin` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `income_year_year_unique` ON `income_year` (`year`);--> statement-breakpoint
CREATE TABLE `yearly_net_worth` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`net_worth` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `yearly_net_worth_year_unique` ON `yearly_net_worth` (`year`);