// Lot size definitions and utility functions
export interface LotSize {
  name: string;
  value: number;
  editable: boolean;
}

export type LotType = 'Standard' | 'Mini' | 'Micro' | 'Nano' | 'Custom';

export const defaultLotSizes: Record<string, LotSize> = {
  Standard: { name: 'Standard', value: 100000, editable: true },
  Mini: { name: 'Mini', value: 10000, editable: true },
  Micro: { name: 'Micro', value: 1000, editable: true },
  Nano: { name: 'Nano', value: 100, editable: true },
  Custom: { name: 'Custom', value: 1, editable: true },
};

// Calculate total units based on lot type and count
export const calculateTotalUnits = (
  lotType: LotType,
  lotCount: number,
  customUnits: number,
  lotSizes: Record<string, LotSize>
): number => {
  if (lotType === 'Custom') {
    return customUnits;
  }
  return lotSizes[lotType].value * lotCount;
};

// Format lot size for display
export const formatLotSize = (
  lotType: LotType,
  lotCount: number,
  customUnits: number,
  lotSizes: Record<string, LotSize>
): string => {
  if (lotType === 'Custom') {
    return `${customUnits.toLocaleString()} units`;
  }
  
  const totalUnits = lotSizes[lotType].value * lotCount;
  return `${lotCount} ${lotType} (${totalUnits.toLocaleString()} units)`;
};