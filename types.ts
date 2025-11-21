
export type CalculatorMode = 'basic' | 'scientific' | 'base';

export type NumberSystem = 'BIN' | 'OCT' | 'DEC' | 'HEX';

export interface HistoryEntry {
  expression: string;
  result: string;
}

export interface Key {
  key: string;
  label: React.ReactNode;
  variant: 'primary' | 'secondary' | 'operator' | 'special';
  span?: boolean;
  disabled?: boolean;
}
