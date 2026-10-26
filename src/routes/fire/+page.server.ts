import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import {
	getSettings,
	setMonthlySpend,
	listMilestones,
	createMilestone,
	updateMilestone,
	deleteMilestone
} from '$lib/server/repositories/fire';
import { latestSnapshot, listSnapshots } from '$lib/server/repositories/networth';
import { listHoldings } from '$lib/server/repositories/holdings';
import { listAccounts } from '$lib/server/repositories/accounts';
import {
	listYearlyNetWorth,
	upsertYearlyNetWorth,
	deleteYearlyNetWorth
} from '$lib/server/repositories/yearly';
import { buildYearlyReview } from '$lib/finance/yearly';
import {
	listIncomeYears,
	upsertIncomeYear,
	deleteIncomeYear,
	listPersonIncomes,
	upsertPersonIncome,
	deletePersonIncome
} from '$lib/server/repositories/income';
import { buildIncomeReview } from '$lib/finance/income';
import { fireNumber, ladderStatus, accessibilitySplit } from '$lib/finance/fire';

const nonEmptyFinite = z.string().trim().min(1).pipe(z.coerce.number().finite());
const nonEmptyNumber = z.string().trim().min(1).pipe(z.coerce.number().finite().nonnegative());
const idSchema = z.coerce.number().int().positive();
const yearSchema = z.object({
	year: z.string().trim().min(1).pipe(z.coerce.number().int()),
	netWorth: nonEmptyNumber
});
const incomeYearSchema = z.object({
	year: z.string().trim().min(1).pipe(z.coerce.number().int()),
	estimatedIncome: nonEmptyNumber,
	investmentIncome: nonEmptyNumber,
	netMonthlyMargin: nonEmptyNumber
});
const personIncomeSchema = z.object({
	id: z.preprocess((v) => (v === '' ? undefined : v), idSchema.optional()),
	year: z.string().trim().min(1).pipe(z.coerce.number().int()),
	name: z.string().trim().min(1),
	amount: nonEmptyNumber
});
const spendSchema = z.object({ monthlySpend: nonEmptyNumber });
const milestoneSchema = z
	.object({
		label: z.string().trim().min(1),
		kind: z.enum(['fixed', 'percent']),
		value: nonEmptyFinite,
		sortOrder: z.coerce.number().int().min(0).optional()
	})
	.refine((m) => m.kind === 'fixed' || m.value >= 0, { path: ['value'] });

export const load: PageServerLoad = async () => {
	const [{ monthlySpend }, milestones, snapshot, holdings, accounts, manualYears, snapshots] =
		await Promise.all([
		getSettings(),
		listMilestones(),
		latestSnapshot(),
		listHoldings(),
		listAccounts(),
		listYearlyNetWorth(),
		listSnapshots()
	]);
	const [incomeYears, personIncomes] = await Promise.all([listIncomeYears(), listPersonIncomes()]);
	const fire = fireNumber(monthlySpend);
	const netWorth = snapshot?.total ?? 0;

	// One call per milestone so each rung keeps its kind (to flag pending percent rungs).
	const rungs = milestones
		.map((m) => ({
			...ladderStatus([{ ...m, kind: m.kind as 'fixed' | 'percent' }], fire, netWorth)[0],
			sortOrder: m.sortOrder,
			pending: m.kind === 'percent' && fire === 0
		}))
		.sort((a, b) => a.sortOrder - b.sortOrder || a.target - b.target);

	return {
		monthlySpend,
		fireNumber: fire,
		netWorth,
		hasSnapshot: !!snapshot,
		rungs,
		milestones: milestones.map((m) => ({
			id: m.id,
			label: m.label,
			kind: m.kind,
			value: m.value,
			sortOrder: m.sortOrder
		})),
		yearly: buildYearlyReview(manualYears, snapshots),
		manualYears,
		income: buildIncomeReview(incomeYears, personIncomes),
		incomeYears,
		personIncomes,
		split: accessibilitySplit(accounts, holdings)
	};
};

export const actions: Actions = {
	setSpend: async ({ request }) => {
		const parsed = spendSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { spendError: 'Enter a monthly spend of 0 or more' });
		await setMonthlySpend(parsed.data.monthlySpend);
		return { success: true };
	},
	createMilestone: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = milestoneSchema.safeParse({ ...form, sortOrder: form.sortOrder || undefined });
		if (!parsed.success) return fail(400, { milestoneError: 'Invalid milestone' });
		const existing = await listMilestones();
		const next = Math.max(-1, ...existing.map((m) => m.sortOrder)) + 1;
		await createMilestone({ ...parsed.data, sortOrder: parsed.data.sortOrder ?? next });
		return { success: true };
	},
	updateMilestone: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = milestoneSchema.safeParse({ ...form, sortOrder: form.sortOrder || undefined });
		if (!parsed.success) return fail(400, { milestoneError: 'Invalid milestone' });
		const id = idSchema.safeParse(form.id);
		if (!id.success) return fail(400, { milestoneError: 'Invalid milestone' });
		const current = (await listMilestones()).find((m) => m.id === id.data);
		if (!current) return fail(400, { milestoneError: 'Invalid milestone' });
		await updateMilestone(id.data, {
			...parsed.data,
			sortOrder: parsed.data.sortOrder ?? current.sortOrder
		});
		return { success: true };
	},
	deleteMilestone: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const id = idSchema.safeParse(form.id);
		if (!id.success) return fail(400, { milestoneError: 'Invalid milestone' });
		await deleteMilestone(id.data);
		return { success: true };
	},
	upsertYear: async ({ request }) => {
		const parsed = yearSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { yearError: 'Enter a year and a net worth of 0 or more' });
		await upsertYearlyNetWorth(parsed.data.year, parsed.data.netWorth);
		return { success: true };
	},
	deleteYear: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const id = idSchema.safeParse(form.id);
		if (!id.success) return fail(400, { yearError: 'Invalid year' });
		await deleteYearlyNetWorth(id.data);
		return { success: true };
	},
	upsertIncomeYear: async ({ request }) => {
		const parsed = incomeYearSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { incomeError: 'Enter a year and amounts of 0 or more' });
		await upsertIncomeYear(parsed.data);
		return { success: true };
	},
	deleteIncomeYear: async ({ request }) => {
		const id = idSchema.safeParse(Object.fromEntries(await request.formData()).id);
		if (!id.success) return fail(400, { incomeError: 'Invalid income year' });
		await deleteIncomeYear(id.data);
		return { success: true };
	},
	upsertPersonIncome: async ({ request }) => {
		const parsed = personIncomeSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { incomeError: 'Enter a year, a name, and an amount of 0 or more' });
		await upsertPersonIncome(parsed.data);
		return { success: true };
	},
	deletePersonIncome: async ({ request }) => {
		const id = idSchema.safeParse(Object.fromEntries(await request.formData()).id);
		if (!id.success) return fail(400, { incomeError: 'Invalid income line' });
		await deletePersonIncome(id.data);
		return { success: true };
	}
};
