export type IncomeRow = {
  year: number;
  persons: { name: string; amount: number }[];
  actualIncome: number;
  actualMonthly: number;
  estimatedIncome: number;
  estimatedMonthly: number;
  investmentIncome: number;
  investmentMonthly: number;
  netMonthlyMargin: number;
};

export function buildIncomeReview(
  incomeYears: { year: number; estimatedIncome: number; investmentIncome: number; netMonthlyMargin: number }[],
  personIncomes: { year: number; name: string; amount: number }[]
): IncomeRow[] {
  const personsByYear = new Map<number, { name: string; amount: number }[]>();
  for (const p of personIncomes) {
    const list = personsByYear.get(p.year) ?? [];
    list.push({ name: p.name, amount: p.amount });
    personsByYear.set(p.year, list);
  }
  const incomeByYear = new Map(incomeYears.map((y) => [y.year, y]));

  const years = [...new Set([...incomeByYear.keys(), ...personsByYear.keys()])].sort((a, b) => a - b);
  return years.map((year) => {
    const persons = personsByYear.get(year) ?? [];
    const inc = incomeByYear.get(year);
    const actualIncome = persons.reduce((sum, p) => sum + p.amount, 0);
    const estimatedIncome = inc?.estimatedIncome ?? 0;
    const investmentIncome = inc?.investmentIncome ?? 0;
    return {
      year,
      persons,
      actualIncome,
      actualMonthly: actualIncome / 12,
      estimatedIncome,
      estimatedMonthly: estimatedIncome / 12,
      investmentIncome,
      investmentMonthly: investmentIncome / 12,
      netMonthlyMargin: inc?.netMonthlyMargin ?? 0
    };
  });
}
