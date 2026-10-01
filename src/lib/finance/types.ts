export interface Lot { shares: number; pricePerShare: number; fee?: number; }
export interface HoldingInput { currentValue: number; lots: Lot[]; }
export interface CategoryTarget { id: number | null; name: string; targetWeight: number; }
export interface HoldingForAllocation { categoryId: number | null; currentValue: number; }
